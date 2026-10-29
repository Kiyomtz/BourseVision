interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  recipientEmail: string;
}

export function EmailPreviewModal({
  isOpen,
  onClose,
  htmlContent,
  recipientEmail,
}: EmailPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[85vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div>
            <div className="text-xs text-slate-400">
              Aperçu de la Newsletter Quotidienne · Destinataire : <span className="text-emerald-400 font-mono">{recipientEmail}</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              Rendu HTML Responsive de l'Email
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Iframe rendering the HTML */}
        <div className="flex-1 bg-slate-950 p-2 overflow-hidden">
          <iframe
            srcDoc={htmlContent}
            title="Aperçu Newsletter"
            className="w-full h-full rounded-lg border border-slate-800 bg-slate-900"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Gabarit compatible avec Outlook, Apple Mail, Gmail et Webmail</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
          >
            Fermer l'Aperçu
          </button>
        </div>

      </div>
    </div>
  );
}
