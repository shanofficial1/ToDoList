import React, { useEffect, useState } from "react";
import { FiPlus, FiTrash, FiCheckSquare, FiX, FiTrash2 } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { FaFire } from "react-icons/fa";

/**
 * ToDoList.jsx
 * - Adds Deleted Tasks section under the ToDoList (persisted to localStorage).
 * - Deleted tasks are stored under key: custom_kanban_deleted_v1
 * - When user permanently deletes from Deleted Tasks, item is removed from localStorage.
 */

/* ----------------- Notification component (simple) ----------------- */
const NOTIFICATION_TTL = 4500;
const SlideInNotifications = ({ notifications, removeNotif }) => {
  const colorForType = {
    backlog: "bg-neutral-700 text-neutral-100",
    todo: "bg-yellow-500 text-neutral-900",
    doing: "bg-sky-500 text-neutral-900",
    done: "bg-emerald-500 text-neutral-900",
    delete: "bg-red-600 text-white",
    default: "bg-indigo-500 text-white",
  };

  return (
    <div className="flex flex-col gap-2 w-80 sm:w-72 fixed top-3 right-3 z-50 pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => {
          const cls = colorForType[n.type] || colorForType.default;
          return (
            <motion.div
              key={n.id}
              layout
              initial={{ y: -10, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ x: 120, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className={`p-2 flex items-start gap-2 text-xs font-medium shadow-lg rounded pointer-events-auto ${cls}`}
            >
              <FiCheckSquare className="mt-0.5" />
              <span className="flex-1">{n.text}</span>
              <button onClick={() => removeNotif(n.id)} className="ml-2 mt-0.5">
                <FiX />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

/* ----------------- Main ToDoList ----------------- */
export const ToDoList = () => {
  return (
    <div className="min-h-screen w-full bg-neutral-900 text-neutral-50">
      <Board />
    </div>
  );
};

const CARDS_KEY = "custom_kanban_cards_v1";
const DELETED_KEY = "custom_kanban_deleted_v1";

const Board = () => {
  const [cards, setCards] = useState(() => {
    try {
      const raw = localStorage.getItem(CARDS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_CARDS;
    } catch {
      return DEFAULT_CARDS;
    }
  });

  const [deleted, setDeleted] = useState(() => {
    try {
      const raw = localStorage.getItem(DELETED_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState([]);

  // persist cards
  useEffect(() => {
    try {
      localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
    } catch {}
  }, [cards]);

  // persist deleted
  useEffect(() => {
    try {
      localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
    } catch {}
  }, [deleted]);

  // notification helpers
  const addNotification = (text, type = "default") => {
    const id = Math.random().toString(36).slice(2, 9);
    setNotifications((pv) => [{ id, text, type }, ...pv]);
    setTimeout(() => {
      setNotifications((pv) => pv.filter((n) => n.id !== id));
    }, NOTIFICATION_TTL);
  };
  const removeNotif = (id) => setNotifications((pv) => pv.filter((n) => n.id !== id));

  // update single card
  const updateCard = (id, patch) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  // add to deleted history (called when a card is removed)
  const addToDeleted = (card) => {
    const entry = {
      ...card,
      deletedAt: new Date().toISOString(),
      deletedId: Math.random().toString(36).slice(2, 9),
    };
    setDeleted((pv) => [entry, ...pv]);
    return entry;
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="px-6 py-4 border-b border-neutral-800">
        <h2 className="text-lg font-semibold text-neutral-50">ToDoList</h2>
      </div>

      <div className="flex flex-col gap-4 p-4 sm:p-12">
        <div className="flex flex-col sm:flex-row gap-6 sm:overflow-x-auto sm:py-2">
          <Column
            title="Backlog"
            column="backlog"
            headingColor="text-neutral-500"
            cards={cards}
            setCards={setCards}
            updateCard={updateCard}
            addNotification={addNotification}
            addToDeleted={(card) => {
              addToDeleted(card);
              addNotification(`Deleted: "${card.title}"`, "delete");
            }}
          />
          <Column
            title="TODO"
            column="todo"
            headingColor="text-yellow-200"
            cards={cards}
            setCards={setCards}
            updateCard={updateCard}
            addNotification={addNotification}
            addToDeleted={(card) => {
              addToDeleted(card);
              addNotification(`Deleted: "${card.title}"`, "delete");
            }}
          />
          <Column
            title="In progress"
            column="doing"
            headingColor="text-blue-200"
            cards={cards}
            setCards={setCards}
            updateCard={updateCard}
            addNotification={addNotification}
            addToDeleted={(card) => {
              addToDeleted(card);
              addNotification(`Deleted: "${card.title}"`, "delete");
            }}
          />
          <Column
            title="Complete"
            column="done"
            headingColor="text-emerald-200"
            cards={cards}
            setCards={setCards}
            updateCard={updateCard}
            addNotification={addNotification}
            addToDeleted={(card) => {
              addToDeleted(card);
              addNotification(`Deleted: "${card.title}"`, "delete");
            }}
          />
          <BurnBarrel
            setCards={setCards}
            cards={cards}
            addNotification={(text) => addNotification(text, "delete")}
            addToDeleted={(card) => {
              addToDeleted(card);
              addNotification(`Deleted: "${card.title}"`, "delete");
            }}
          />
        </div>

        {/* Deleted tasks section under the board */}
        <DeletedTasks
          deleted={deleted}
          setDeleted={setDeleted}
          permanentlyRemove={(deletedId) => {
            setDeleted((pv) => pv.filter((d) => d.deletedId !== deletedId));
            addNotification("Permanently removed", "delete");
          }}
          clearAll={() => {
            setDeleted([]);
            addNotification("Cleared deleted history", "delete");
          }}
        />
      </div>

      <SlideInNotifications notifications={notifications} removeNotif={removeNotif} />
    </div>
  );
};

/* ----------------- Column ----------------- */
const Column = ({ title, headingColor, cards, column, setCards, updateCard, addNotification, addToDeleted }) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  const handleDragEnd = (e) => {
    const cardId = e.dataTransfer.getData("cardId");
    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);
    const before = element.dataset.before || "-1";

    if (before !== cardId) {
      let copy = [...cards];
      let cardToTransfer = copy.find((c) => c.id === cardId);
      if (!cardToTransfer) return;
      cardToTransfer = { ...cardToTransfer, column };

      copy = copy.filter((c) => c.id !== cardId);

      const moveToBack = before === "-1";
      if (moveToBack) {
        copy.push(cardToTransfer);
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before);
        if (insertAtIndex === undefined) return;
        copy.splice(insertAtIndex, 0, cardToTransfer);
      }

      setCards(copy);
      if (addNotification) addNotification(`Moved: "${cardToTransfer.title}" → ${title}`, column);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };

  const clearHighlights = (els) => {
    const indicators = els || getIndicators();
    indicators.forEach((i) => (i.style.opacity = "0"));
  };

  const highlightIndicator = (e) => {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const el = getNearestIndicator(e, indicators);
    el.element.style.opacity = "1";
  };

  const getNearestIndicator = (e, indicators) => {
    const DISTANCE_OFFSET = 50;
    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY, element: indicators[indicators.length - 1] }
    );
    return el;
  };

  const getIndicators = () => Array.from(document.querySelectorAll(`[data-column="${column}"]`));
  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  // Filter cards for this column
  const filteredCards = cards.filter((c) => c.column === column);

  return (
    <div className="w-[90vw] sm:w-[40vw] md:w-[30vw] lg:w-[22vw] min-w-[220px] mx-auto">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        <span className="rounded text-sm text-neutral-400">{filteredCards.length}</span>
      </div>

      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`min-h-[120px] w-full transition-colors ${active ? "bg-neutral-800/50" : "bg-neutral-800/0"} rounded-md p-3`}
      >
        {filteredCards.map((c) => (
          <Card key={c.id} {...c} handleDragStart={handleDragStart} updateCard={updateCard} setCards={setCards} addToDeleted={addToDeleted} />
        ))}
        <DropIndicator beforeId={null} column={column} />
        <AddCard column={column} setCards={setCards} addNotification={addNotification} />
      </div>
    </div>
  );
};

/* ----------------- Card ----------------- */
const Card = ({ title, id, column, handleDragStart, updateCard, setCards, addToDeleted }) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(title);

  useEffect(() => setText(title), [title]);

  const save = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      // if user cleared the title while editing, move to deleted history
      const card = { id, title, column };
      if (addToDeleted) addToDeleted(card);
      setCards((pv) => pv.filter((c) => c.id !== id));
    } else {
      updateCard(id, { title: trimmed });
    }
    setEditing(false);
  };

  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      <motion.div
        layout
        layoutId={id}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, { title, id, column })}
        className="mb-3 cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing"
        onDoubleClick={() => setEditing(true)}
      >
        {!editing ? (
          <p className="text-sm text-neutral-100 break-words">{title}</p>
        ) : (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
              onBlur={save}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  save();
                } else if (e.key === "Escape") {
                  setEditing(false);
                  setText(title);
                }
              }}
              className="w-full rounded border border-violet-400 bg-violet-400/10 p-2 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0"
            />
            <div className="mt-1 flex justify-end">
              <button onClick={save} className="text-xs px-2 py-1 rounded bg-neutral-50 text-neutral-900">
                Save
              </button>
            </div>
          </>
        )}
      </motion.div>
    </>
  );
};

/* ----------------- DropIndicator ----------------- */
const DropIndicator = ({ beforeId, column }) => (
  <div data-before={beforeId || "-1"} data-column={column} className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0" />
);

/* ----------------- BurnBarrel (delete target) ----------------- */
const BurnBarrel = ({ setCards, cards, addNotification, addToDeleted }) => {
  const [active, setActive] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = () => setActive(false);

  const handleDragEnd = (e) => {
    const cardId = e.dataTransfer.getData("cardId");
    const card = cards.find((c) => c.id === cardId);
    if (card) {
      setCards((pv) => pv.filter((c) => c.id !== cardId));
      if (addToDeleted) addToDeleted(card);
      if (addNotification) addNotification(`Deleted: "${card.title}"`, "delete");
    }
    setActive(false);
  };

  return (
    <div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`mt-4 sm:mt-10 grid h-40 sm:h-64 w-[90vw] sm:w-[40vw] md:w-[30vw] lg:w-[22vw] min-w-[220px] mx-auto shrink-0 place-content-center rounded border text-4xl ${active ? "border-red-800 bg-red-800/20 text-red-500" : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
        }`}
    >
      {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
    </div>
  );
};

/* ----------------- AddCard ----------------- */
const AddCard = ({ column, setCards, addNotification }) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim().length) return;
    const newCard = { column, title: text.trim(), id: Math.random().toString(36).slice(2, 9) };
    setCards((pv) => [...pv, newCard]);
    setAdding(false);
    setText("");
    if (addNotification) addNotification(`Added: "${newCard.title}"`, column);
  };

  return (
    <>
      {adding ? (
        <motion.form layout onSubmit={handleSubmit}>
          <textarea value={text} onChange={(e) => setText(e.target.value)} autoFocus placeholder="Add new task..." className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0" />
          <div className="mt-1.5 flex items-center justify-end gap-1.5">
            <button onClick={() => { setAdding(false); setText(""); }} className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50" type="button">
              Close
            </button>
            <button type="submit" className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300">
              <span>Add</span>
              <FiPlus />
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.button layout onClick={() => setAdding(true)} className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50">
          <span>Add card</span>
          <FiPlus />
        </motion.button>
      )}
    </>
  );
};

/* ----------------- DeletedTasks UI ----------------- */
const DeletedTasks = ({ deleted, setDeleted, permanentlyRemove, clearAll }) => {
  return (
    <section className="w-full max-w-6xl mx-auto mt-6 px-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-medium text-neutral-300">Deleted Tasks</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => clearAll()}
            className="text-xs rounded bg-red-700/20 px-3 py-1 text-red-300 hover:bg-red-700/40"
          >
            Clear all
          </button>
        </div>
      </div>

      {deleted.length === 0 ? (
        <div className="rounded border border-neutral-800 bg-neutral-900 p-4 text-neutral-400">No deleted tasks</div>
      ) : (
        <div className="space-y-2">
          {deleted.map((d) => (
            <div key={d.deletedId} className="flex items-start gap-3 rounded border border-neutral-700 bg-neutral-800 p-3">
              <div className="flex-1">
                <div className="flex items-baseline gap-3">
                  <strong className="text-sm text-neutral-50">{d.title}</strong>
                  <span className="text-xs text-neutral-400">({d.column})</span>
                </div>
                <div className="text-xs text-neutral-400 mt-1">Deleted: {new Date(d.deletedAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => permanentlyRemove(d.deletedId)}
                  className="rounded bg-red-600/20 px-2 py-1 text-xs text-red-300 hover:bg-red-600/40"
                  title="Permanently delete"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

/* ----------------- Defaults ----------------- */
const DEFAULT_CARDS = [
  { title: "Look into render bug in dashboard", id: "1", column: "backlog" },
  { title: "SOX compliance checklist", id: "2", column: "backlog" },
  { title: "[SPIKE] Migrate to Azure", id: "3", column: "backlog" },
  { title: "Document Notifications service", id: "4", column: "backlog" },
  { title: "Research DB options for new microservice", id: "5", column: "todo" },
  { title: "Postmortem for outage", id: "6", column: "todo" },
  { title: "Sync with product on Q3 roadmap", id: "7", column: "todo" },
  { title: "Refactor context providers to use Zustand", id: "8", column: "doing" },
  { title: "Add logging to daily CRON", id: "9", column: "doing" },
  { title: "Set up DD dashboards for Lambda listener", id: "10", column: "done" },
];
