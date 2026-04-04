"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCenter, useDroppable,
  type DragStartEvent, type DragEndEvent, type UniqueIdentifier,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { animate } from "motion";
import { colors, fonts, space, radii, text, shadow } from "@/lib/theme";

interface CardItem { id: string; label: string; detail?: string }

interface CardSortProps {
  cards: CardItem[];
  buckets: { id: string; label: string; color?: string }[];
  onSort?: (bucketId: string, cardIds: string[]) => void;
  allowAdd?: boolean;
  onAddCard?: (card: CardItem) => void;
}

const cardLabel: React.CSSProperties = {
  fontFamily: fonts.body, fontSize: text.body.fontSize,
  fontWeight: 500, color: colors.textPrimary, lineHeight: text.body.lineHeight,
};
const cardDetail: React.CSSProperties = {
  fontFamily: fonts.bodyAlt, fontSize: text.secondary.fontSize,
  color: colors.textMuted, marginTop: space[1], lineHeight: text.secondary.lineHeight,
};

function SortableCard({ card, isDragging, justLanded, onRemove }: { card: CardItem; isDragging?: boolean; justLanded?: boolean; onRemove?: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (justLanded && cardRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (animate as any)(cardRef.current, { scale: [1.06, 0.97, 1] }, { duration: 0.35, easing: [0.22, 1, 0.36, 1] });
    }
  }, [justLanded]);

  return (
    <div ref={(node) => { setNodeRef(node); (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node; }} {...attributes} {...listeners} style={{
      transform: transform ? `translate3d(${transform.x}px,${transform.y}px,0)` : undefined,
      transition, padding: `${space[3]}px ${space[4]}px`, backgroundColor: colors.bgElevated,
      borderRadius: radii.sm, border: `1px solid ${colors.borderDefault}`,
      cursor: "grab", opacity: isDragging ? 0.4 : 1, touchAction: "none",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={cardLabel}>{card.label}</div>
          {card.detail && <div style={cardDetail}>{card.detail}</div>}
        </div>
        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(card.id); }}
            style={{
              background: "none", border: "none", color: colors.textMuted,
              fontSize: 14, cursor: "pointer", padding: "0 2px", lineHeight: 1,
              opacity: 0.5, flexShrink: 0,
            }}
            title="Remove this card"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

function Bucket({ id, label, color, cards, isOver, activeId, lastLanded, onRemoveCard }: {
  id: string; label: string; color?: string; cards: CardItem[];
  isOver: boolean; activeId: UniqueIdentifier | null; lastLanded?: string | null;
  onRemoveCard?: (cardId: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} style={{
      flex: 1, minWidth: 160, backgroundColor: isOver ? colors.coralWash : colors.bgRecessed,
      borderRadius: radii.md, border: `1px solid ${isOver ? colors.coral : colors.borderSubtle}`,
      transition: "background-color 0.2s, border-color 0.2s", overflow: "hidden",
    }}>
      <div style={{
        padding: `${space[2]}px ${space[3]}px`, backgroundColor: color || colors.plum,
        ...text.caption, color: colors.textPrimary, textTransform: "uppercase" as const,
      }}>{label}</div>
      <div style={{ padding: space[2], display: "flex", flexDirection: "column", gap: space[2], minHeight: 60 }}>
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((c) => <SortableCard key={c.id} card={c} isDragging={activeId === c.id} justLanded={lastLanded === c.id} onRemove={onRemoveCard} />)}
        </SortableContext>
        {cards.length === 0 && !isOver && (
          <div style={{ padding: space[3], textAlign: "center", fontFamily: fonts.bodyAlt,
            fontSize: text.secondary.fontSize, color: colors.textMuted, fontStyle: "italic" }}>
            Drop cards here
          </div>
        )}
      </div>
    </div>
  );
}

const UNSORTED = "__unsorted__";

export default function CardSort({ cards, buckets, onSort, allowAdd, onAddCard }: CardSortProps) {
  const [bucketMap, setBucketMap] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = { [UNSORTED]: cards.map((c) => c.id) };
    buckets.forEach((b) => (init[b.id] = []));
    return init;
  });
  const [allCards, setAllCards] = useState<CardItem[]>(cards);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [overBucket, setOverBucket] = useState<string | null>(null);
  const [lastLanded, setLastLanded] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const findBucket = useCallback((cardId: UniqueIdentifier): string | null => {
    for (const [bId, cIds] of Object.entries(bucketMap)) {
      if (cIds.includes(String(cardId))) return bId;
    }
    return null;
  }, [bucketMap]);

  const handleDragOver = (e: { over: { id: UniqueIdentifier } | null }) => {
    if (!e.over) { setOverBucket(null); return; }
    const overId = String(e.over.id);
    setOverBucket(bucketMap[overId] !== undefined ? overId : findBucket(e.over.id));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    setOverBucket(null);
    const { active, over } = e;
    if (!over) return;
    const fromBucket = findBucket(active.id);
    if (!fromBucket) return;
    const overId = String(over.id);
    const toBucket = bucketMap[overId] !== undefined ? overId : findBucket(over.id);
    if (!toBucket || fromBucket === toBucket) return;
    const cardId = String(active.id);
    setBucketMap((prev) => {
      const next = { ...prev };
      next[fromBucket] = prev[fromBucket].filter((id) => id !== cardId);
      next[toBucket] = [...prev[toBucket], cardId];
      if (toBucket !== UNSORTED) onSort?.(toBucket, next[toBucket]);
      return next;
    });
    setLastLanded(cardId);
    setTimeout(() => setLastLanded(null), 400);
  };

  const handleAdd = () => {
    const label = newLabel.trim();
    if (!label) return;
    const card: CardItem = { id: `custom-${Date.now()}`, label };
    setAllCards((prev) => [...prev, card]);
    setBucketMap((prev) => ({ ...prev, [UNSORTED]: [...prev[UNSORTED], card.id] }));
    onAddCard?.(card);
    setNewLabel("");
  };

  const handleRemoveCard = (cardId: string) => {
    setAllCards((prev) => prev.filter((c) => c.id !== cardId));
    setBucketMap((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = next[key].filter((id) => id !== cardId);
      }
      return next;
    });
  };

  const activeCard = activeId ? allCards.find((c) => c.id === String(activeId)) : null;
  const lookup = (ids: string[]) => ids.map((id) => allCards.find((c) => c.id === id)!).filter(Boolean);

  return (
    <div style={{ fontFamily: fonts.body }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter}
        onDragStart={(e: DragStartEvent) => setActiveId(e.active.id)}
        onDragOver={handleDragOver} onDragEnd={handleDragEnd}>

        {/* Buckets first — so the user sees where they're sorting TO */}
        <div style={{ display: "flex", gap: space[3], marginBottom: space[4], flexWrap: "wrap" }}>
          {buckets.map((b) => (
            <Bucket key={b.id} id={b.id} label={b.label} color={b.color}
              cards={lookup(bucketMap[b.id])} isOver={overBucket === b.id} activeId={activeId} lastLanded={lastLanded} onRemoveCard={handleRemoveCard} />
          ))}
        </div>

        {/* Unsorted cards below */}
        <Bucket id={UNSORTED} label="Unsorted" color={colors.bgElevated}
          cards={lookup(bucketMap[UNSORTED])} isOver={overBucket === UNSORTED} activeId={activeId} lastLanded={lastLanded} onRemoveCard={handleRemoveCard} />

        {allowAdd && (
          <div style={{ display: "flex", gap: space[2], marginTop: space[3] }}>
            <input type="text" value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Add a card..." style={{
                flex: 1, padding: `${space[2]}px ${space[3]}px`, backgroundColor: colors.bgInput,
                border: `1px solid ${colors.borderDefault}`, borderRadius: radii.sm,
                color: colors.textPrimary, fontFamily: fonts.bodyAlt, fontSize: text.body.fontSize, outline: "none",
              }} />
            <button onClick={handleAdd} style={{
              padding: `${space[2]}px ${space[4]}px`, backgroundColor: colors.coral, color: colors.bgDeep,
              border: "none", borderRadius: radii.sm, fontFamily: fonts.body,
              fontSize: text.secondary.fontSize, fontWeight: 600, cursor: "pointer",
            }}>Add</button>
          </div>
        )}

        <DragOverlay dropAnimation={null}>
          {activeCard && (
            <div style={{ padding: `${space[3]}px ${space[4]}px`, backgroundColor: colors.bgElevated,
              borderRadius: radii.sm, border: `2px solid ${colors.coral}`, boxShadow: shadow.lg,
              cursor: "grabbing", transform: "rotate(2deg) scale(1.04)" }}>
              <div style={cardLabel}>{activeCard.label}</div>
              {activeCard.detail && <div style={cardDetail}>{activeCard.detail}</div>}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
