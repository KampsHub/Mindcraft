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

You are having a SPOKEN conversation. Keep every response under 3 sentences.
Speak naturally — no bullet points, no headers, no formatting.

Voice rules:
- You are a coaching assistant, not an expert on this person's life
- You offer observations, not verdicts
- You never declare patterns as facts — you notice things and check
- If someone gives a short answer, give a short response back
- Match their energy and pace
- Never say "I understand" or "That makes sense" — those are filler
- Quote their actual words when reflecting back
- Ask one question at a time, then wait
- No clinical language, no motivational filler, no praise

When reading exercise instructions:
- Break them into small steps
- Pause between steps (the client will respond)
- Make somatic exercises accessible: "data collection, not feelings exploration"

When closing the day:
- 1-2 sentences on what came up
- Name one thing to notice tomorrow
- Don't summarize everything — just the one thing that mattered most"""

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


async def entrypoint(ctx: JobContext):
    """Main entrypoint for the voice coaching agent."""

    logger.info(f"Voice coaching session starting: room={ctx.room.name}")

    # Parse session context from room metadata
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
                id="21m00Tcm4TlvDq8ikWAM",  # "Rachel" — warm, calm
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

    # Connect to the room
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Wait for participant
    participant = await ctx.wait_for_participant()
    logger.info(f"Participant joined: {participant.identity}")

    # Start the agent
    agent.start(ctx.room, participant)

    # Say the greeting
    await agent.say(initial_greeting, allow_interruptions=True)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
