import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CloudUpload, Info, Pencil } from "lucide-react";
// import { Textarea } from "@/components/ui/textarea";

const UploadPanel = () => {
  const [panelState, setPanelState] = useState<"input" | "review" | "edit">("input");
  
  type NamesInfo = {
    sumber_data : string;
    baris_kosong : number;
    nama_dup : number;
    nama_panjang : number;
    nama_terpanjang : string;
    lima_pertama : string[];
    semua_nama : string[];
    jmlh_nama_valid : number;
  }
  const [namesInfo, setNamesInfo] = useState<NamesInfo | null>(null);

  // const [textError, setTextError] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const HandleInputFile = (event : React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if(!file){
      return;
    };

    console.log(file.name);
    console.log(file.type);
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const HandleInputText = (name_list : string | undefined) => {
    if(!name_list){
      return;
    };

    const raw_lines = name_list.split('\n');

    let baris_kosong = 0
    let nama_panjang = 0;
    let nama_terpanjang = "";
    const seen = new Set<string>();
    let nama_dup = 0;
    const semua_nama: string[] = [];
    let jmlh_nama_valid = 0;

    for (const cur_line of raw_lines){
      const nama = cur_line.trim();

      if(nama === ""){
        baris_kosong++;
        //yg ini no error
        continue;
      }

      //Add to error
      if(nama.length > 150){
        nama_panjang++;
        // add error 1 nama lebih dari 150 karakter dilewati.
        continue;
      }

      if(nama.length > nama_terpanjang.length){
        nama_terpanjang = nama;
      }

      const key = nama.toLowerCase();
      if (seen.has(key)) {
        // add error 1 nama duplikat dipertahankan
        nama_dup++;
        continue;
      }
      seen.add(key);
      jmlh_nama_valid++;
      semua_nama.push(cur_line);
    };

    setNamesInfo({
      sumber_data: "Teks",
      baris_kosong,
      nama_dup,
      nama_panjang,
      nama_terpanjang,
      lima_pertama: semua_nama.slice(0, 5),
      semua_nama,
      jmlh_nama_valid,
    });

    setPanelState("review");
  };

  switch (panelState) {
    case "input":
      return (
        <div className="w-full">
          <div className="flex h-full flex-col gap-4 overflow-auto mt-5">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={HandleInputFile}
              />

              <Button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-row items-center justify-start h-auto items-start gap-1 px-4 py-3 text-left whitespace-normal">
                <div className="rounded-lg bg-transparent p-2">
                  <CloudUpload className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <p>Unggah XLSX atau CSV</p>
                  <p className="mt-2 text-xs text-muted-foreground">Kolom pertama yang berisi data yang akan digunakan.</p>
                </div>
              </Button>

              <br></br>

              <p>Menulis Daftar Nama</p>
              <textarea 
              ref={textareaRef}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" 
              placeholder="John Doe
Jad Abyanza Fauzan">
              </textarea>
              <p className="mt-2 text-xs text-muted-foreground">Satu baris dianggap satu nama. Maksimal 150 karakter per nama.</p>

              <Button className="" onClick={() => HandleInputText(textareaRef.current?.value)}>Gunakan daftar ini</Button>
            </div>
          </div>
        </div>
      );
  
    case "review":
      return(
        <div className="w-full">
          <div className="flex h-full flex-col gap-4 overflow-auto mt-5">
            <div className="bg-card p-8">

              <div className="rounded-lg border border-border p-3 flex flex-row mt-2">
                <p>Sumber Data : {namesInfo?.sumber_data}</p>
                <p className="ml-auto">{namesInfo?.jmlh_nama_valid} nama valid</p>
              </div>

              <div className="rounded-lg border border-border p-3">
                <p className="mt-1 text-sm text-gray-500">Baris kosong dilewati : {namesInfo?.baris_kosong}</p>
                <p className="mt-1 text-sm text-gray-500">Nama Duplikat :  {namesInfo?.nama_dup}</p>
                <p className="mt-1 text-sm text-gray-500">Nama terlalu panjang : {namesInfo?.nama_panjang}</p>
              </div>

              <div className="rounded-lg p-5 bg-orange flex flex-row">
                <Info className="h-5 w-5 text-blue-600"/>
              </div>

              <p className="mt-1 text-sm text-gray-500">Lima nama pertama :</p>
              <div>
                {namesInfo?.lima_pertama.map((nama, i) => (
                  <p key={i}>{nama}</p>
                ))}
              </div>
              
              <p>Nama terpanjang : {namesInfo?.nama_terpanjang}</p>

              <div>
                <Button className="rounded-full border bg-transparent hover:bg-transparen">Lihat seluruh daftar</Button>
                <Button className="rounded-full border bg-transparent hover:bg-transparen" onClick={() => setPanelState("edit")}><Pencil/>Edit daftar</Button>
                <Button className="rounded-full border bg-transparent hover:bg-transparen">Ganti data</Button>  
              </div>

              <Button className="bg-transparent text-red-500 hover:bg-transparent hover:text-red-600" onClick={() => setPanelState("input")}>Hapus</Button>
            </div>
          </div>
        </div>
      );

    case "edit":
      return(
        <div className="w-full">
          <div className="flex h-full flex-col gap-4 overflow-auto mt-5">
            <p>Edit daftar nama</p>

             <textarea 
              ref={textareaRef}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" 
            />

            <p className="mt-2 text-xs text-muted-foreground">Satu baris dianggap satu nama. Maksimal 150 karakter per nama.</p>

            <div>
              <Button onClick={() => HandleInputText(textareaRef.current?.value)}>Simpan daftar</Button>
              <Button onClick={() => setPanelState("review")}>Batal</Button>
            </div>
          </div>
        </div>
      );
  }
};

export default UploadPanel;