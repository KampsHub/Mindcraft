"""
Mindcraft Voice Coaching Agent
==============================
A LiveKit Agent that runs a full daily coaching session via voice.

Flow:
1. Client connects → Agent greets and reads yesterday's exercise follow-through
2. Client responds → Agent reads thought inspiration prompts
3. Client journals by speaking → Agent processes and reads coach's response
4. Agent asks coaching questions one at a time → Client responds
5. Agent reads exercise instructions → Client works through them
6. Agent summarizes and closes the day

The agent uses:
- Deepgram for speech-to-text (STT)
- Claude for coaching intelligence (LLM)
- ElevenLabs for text-to-speech (TTS)
- Silero for voice activity detection (VAD)
"""

import asyncio
import json
import logging
import os
from dataclasses import dataclass
from typing import Optional

from dotenv import load_dotenv
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    llm,
)
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import deepgram, elevenlabs, silero

import anthropic

load_dotenv()
logger = logging.getLogger("mindcraft-voice")


@dataclass
class SessionContext:
    """Context passed to the agent via room metadata."""
    enrollment_id: str = ""
    day_number: int = 1
    program_name: str = "Parachute"
    user_name: str = ""
    yesterday_exercise: str = ""
    yesterday_exercise_instruction: str = ""
    thought_prompts: list[str] = None
    territory: str = ""
    week_purpose: str = ""

    def __post_init__(self):
        if self.thought_prompts is None:
            self.thought_prompts = []


class MindcraftLLM(llm.LLM):
    """
    Custom LLM wrapper that uses Claude with the Mindcraft coaching voice.
    """

    def __init__(self):
        super().__init__()
        self._client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
        self._conversation_history: list[dict] = []
        self._system_prompt = self._build_system_prompt()

    def _build_system_prompt(self) -> str:
        return """You are a voice coaching assistant for Mindcraft — a 30-day coaching program.

You are having a SPOKEN conversation. This should feel like talking to a sharp, warm colleague — not a therapist, not a chatbot.

## Response length
- Default: 1-3 sentences. That's it.
- Only go longer if they explicitly ask for detail or if you're walking through exercise steps.
- If they said 5 words, you respond with 10 words. Match their energy exactly.

## Conversation flow
- After answering, connect one thing from the current exercise to something from their recent context. Don't just respond — add value.
- If interrupted, say "got it" or "sure" and address their point immediately. Don't repeat what you were saying. Move on.
- Ask one question at a time, then wait. Never stack questions.
- When there's a natural pause after they finish speaking, wait 1-2 seconds before responding. Don't jump in instantly.

## Voice rules
- You are a coaching assistant, not an expert on this person's life.
- You offer observations, not verdicts. Use "It sounds like..." not "You are..."
- Never declare patterns as facts — you notice things and check.
- Never say "Great question!", "That's interesting!", "I understand", or "That makes sense." These are filler. Just respond.
- Never say "Thank you for sharing" or any variation. Just respond to what they said.
- No clinical language, no motivational filler, no praise.
- Quote their actual words when reflecting back — don't paraphrase.

## Exercise guidance
- You already have all the context. Don't ask clarifying questions you can answer from the data.
- Break exercises into small steps. Give one step, wait for their response, then give the next.
- Make somatic exercises accessible: "This is data collection, not feelings exploration."
- If a concept needs explaining (saboteur, parts, somatic), explain it in one sentence before using it.

## Closing
- 1-2 sentences on what came up — the single most important thing.
- Name one thing to notice before next session.
- Don't summarize everything. Less is more."""

    async def chat(
        self,
        *,
        chat_ctx: llm.ChatContext,
        conn_options: llm.LLMOptions = None,
        fnc_ctx: Optional[llm.FunctionContext] = None,
    ) -> llm.LLMStream:
        # Convert chat context to Claude messages
        messages = []
        for msg in chat_ctx.messages:
            if msg.role == "system":
                continue  # System is handled separately
            role = "user" if msg.role == "user" else "assistant"
            content = msg.content or ""
            if content:
                messages.append({"role": role, "content": content})

        # Ensure alternating roles
        cleaned = []
        for msg in messages:
            if cleaned and cleaned[-1]["role"] == msg["role"]:
                cleaned[-1]["content"] += " " + msg["content"]
            else:
                cleaned.append(msg)

        if not cleaned or cleaned[0]["role"] != "user":
            cleaned.insert(0, {"role": "user", "content": "(session started)"})

        response = self._client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,  # Keep responses short for voice
            system=self._system_prompt,
            messages=cleaned,
        )

        text = response.content[0].text if response.content else ""
        return _TextLLMStream(text)


class _TextLLMStream(llm.LLMStream):
    """Simple stream that yields a complete text response."""

    def __init__(self, text: str):
        super().__init__(
            chat_ctx=llm.ChatContext(),
            conn_options=llm.LLMOptions(),
        )
        self._text = text

    async def _run(self):
        # Yield the text as a single chunk
        self._event_ch.send_nowait(
            llm.ChatChunk(
                choices=[
                    llm.Choice(
                        delta=llm.ChoiceDelta(
                            role="assistant",
                            content=self._text,
                        ),
                        index=0,
                    )
                ]
            )
        )


def _build_exercise_system_prompt(exercise_name: str, instructions: str, why_now: str) -> str:
    """Build a system prompt for guided exercise mode."""
    return f"""You are a voice coaching assistant guiding someone through a specific exercise.

This is a SPOKEN conversation. It should feel like doing an exercise with a sharp, warm colleague sitting across from you.

EXERCISE: {exercise_name}
{f"WHY NOW: {why_now}" if why_now else ""}

INSTRUCTIONS TO GUIDE THROUGH:
{instructions}

## How to guide
1. Start with one sentence: what the exercise is and why you're doing it right now. No preamble.
2. If the exercise uses a concept (saboteur, parts, somatic mapping), explain it in plain language in one sentence before using it. Example: "A saboteur is an inner voice that criticizes or shames you — like a harsh internal boss."
3. Give ONE step at a time. After each step, ask a specific question and WAIT for their response.
4. When they respond, reflect back using their exact words (not your interpretation), connect it to something from their context if relevant, then give the next step.
5. If they interrupt you mid-step, say "got it" and address their point. Don't repeat what you were saying.
6. When all steps are done, name the ONE thing that seemed to matter most. Don't summarize everything.

## Response length
- 1-3 sentences per response. Never more unless walking through a multi-part step.
- If they give a short answer, respond with a short reflection and move on.
- Don't pad with filler. Silence is fine.

## What NOT to do
- Never say "Great question!", "That's interesting!", "I understand", "That makes sense", or "Thank you for sharing."
- Never declare what they're feeling. Use "It sounds like..." not "You are..."
- Never stack multiple questions. One question, then wait.
- Don't ask clarifying questions you can answer from the context you already have.
- Quote their actual words when reflecting back
- No clinical language, no motivational filler, no praise
- Make somatic exercises accessible: "data collection, not feelings exploration"
- If they seem stuck, offer a concrete example or reframe the question"""


async def entrypoint(ctx: JobContext):
    """Main entrypoint for the voice coaching agent."""

    logger.info(f"Voice coaching session starting: room={ctx.room.name}")

    # Connect to the room first
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Wait for participant
    participant = await ctx.wait_for_participant()
    logger.info(f"Participant joined: {participant.identity}")

    # Check participant metadata for exercise mode
    exercise_meta = None
    if participant.metadata:
        try:
            meta = json.loads(participant.metadata)
            if meta.get("mode") == "exercise":
                exercise_meta = meta
                logger.info(f"Exercise mode: {meta.get('exerciseName', 'unknown')}")
        except (json.JSONDecodeError, TypeError):
            pass

    if exercise_meta:
        # ── Exercise mode ──
        exercise_name = exercise_meta.get("exerciseName", "Exercise")
        instructions = exercise_meta.get("instructions", "")
        why_now = exercise_meta.get("whyNow", "")

        system_prompt = _build_exercise_system_prompt(exercise_name, instructions, why_now)

        agent = VoicePipelineAgent(
            vad=silero.VAD.load(),
            stt=deepgram.STT(),
            llm=MindcraftLLM(),
            tts=elevenlabs.TTS(
                voice=elevenlabs.Voice(
                    id="l4Coq6695JDX9xtLqXDE",
                    settings=elevenlabs.VoiceSettings(
                        stability=0.7,
                        similarity_boost=0.8,
                    ),
                ),
            ),
            chat_ctx=llm.ChatContext().append(
                role="system",
                text=system_prompt,
            ),
        )

        agent.start(ctx.room, participant)

        greeting = f"Let's work through {exercise_name}."
        if why_now:
            greeting += f" {why_now}"
        greeting += " I'll walk you through it step by step."

        await agent.say(greeting, allow_interruptions=True)

    else:
        # ── Standard coaching session mode ──
        session = SessionContext()
        if ctx.room.metadata:
            try:
                meta = json.loads(ctx.room.metadata)
                session = SessionContext(**{k: v for k, v in meta.items() if hasattr(session, k)})
            except (json.JSONDecodeError, TypeError):
                logger.warning("Could not parse room metadata")

        # Build initial greeting
        greeting_parts = [f"Hey. Welcome to Day {session.day_number}."]

        if session.week_purpose:
            greeting_parts.append(session.week_purpose)

        if session.yesterday_exercise:
            greeting_parts.append(
                f"Yesterday you worked on {session.yesterday_exercise}. "
                f"Did anything come up since then? What did you notice?"
            )
        else:
            greeting_parts.append("Ready to start? Just talk — I'm listening.")

        initial_greeting = " ".join(greeting_parts)

        # Set up the voice pipeline
        agent = VoicePipelineAgent(
            vad=silero.VAD.load(),
            stt=deepgram.STT(),
            llm=MindcraftLLM(),
            tts=elevenlabs.TTS(
                voice=elevenlabs.Voice(
                    id="l4Coq6695JDX9xtLqXDE",
                    settings=elevenlabs.VoiceSettings(
                        stability=0.7,
                        similarity_boost=0.8,
                    ),
                ),
            ),
            chat_ctx=llm.ChatContext().append(
                role="system",
                text=f"""Session context:
Program: {session.program_name}
Day: {session.day_number}
Territory: {session.territory}
Week purpose: {session.week_purpose}

Thought prompts for today: {json.dumps(session.thought_prompts)}

Start by greeting the client and asking about yesterday's exercise.
Then guide them through today's session conversationally.
Ask one question at a time. Wait for their response before moving on."""
            ),
        )

        agent.start(ctx.room, participant)
        await agent.say(initial_greeting, allow_interruptions=True)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
