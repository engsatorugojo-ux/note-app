const COLORS = [
  "#FFFFFF", "#FFF9A3", "#FFB3C6", "#B3D9FF",
  "#C8F7C5", "#FFD9A3", "#E8B3FF",
];

export default function NoteCard({ note, onClick }) {
  const date = new Date(note.updated_at).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div
      onClick={onClick}
      className="relative border-2 border-black shadow-[4px_4px_0px_#000] cursor-pointer
                 hover:shadow-[6px_6px_0px_#000] hover:-translate-x-px hover:-translate-y-px
                 transition-all duration-100 flex flex-col"
      style={{ backgroundColor: note.color || "#FFFFFF", minHeight: "180px" }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1 border-b-2 border-black">
        <span className="text-lg" title={note.pinned ? "Pinned" : "Not pinned"}>
          {note.pinned ? "📌" : ""}
        </span>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{date}</span>
      </div>

      {/* Content */}
      <div className="px-3 py-2 flex-1 overflow-hidden">
        {note.title && (
          <h3 className="font-black text-sm leading-snug mb-1 line-clamp-2 break-words">
            {note.title}
          </h3>
        )}
        <p className="text-xs text-gray-700 leading-relaxed line-clamp-5 break-words whitespace-pre-wrap">
          {note.content}
        </p>
      </div>
    </div>
  );
}

export { COLORS };
