import { useState } from "react";

const UploadPanel = () => {
  const [panelState, setPanelState] = useState<"input" | "review">("input");

  if(panelState === "input"){
    return (
      <div className="flex h-full flex-col gap-4 overflow-auto">
        <div className="rounded-lg border border-border bg-card p-8">

          <p>Unggah XLSX atau CSV</p>
          <p className="mt-2 text-xs text-muted-foreground">Kolom pertama yang berisi data yang akan digunakan.</p>

          <p>Menulis Daftar Nama</p>
          <textarea className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" 
          placeholder="John Doe
Jad Abyanza Fauzan">
          </textarea>
          <p className="mt-2 text-xs text-muted-foreground">Satu baris dianggap satu nama. Maksimal 150 karakter per nama.</p>

          <button className="" onClick={() => setPanelState("review")}>Gunakan daftar ini</button>
        </div>
      </div>
    );
  }
  
  else {
    return (
      <div className="flex h-full flex-col gap-4 overflow-auto">
        <div className="rounded-lg border border-border bg-card p-8">
          {/* Nanti buat pas review nya */}
          <button className="" onClick={() => setPanelState("input")}>Hapus</button>
        </div>
      </div>
    );
  }
};

export default UploadPanel;
