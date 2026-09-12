import { useRef, ChangeEvent } from "react";
import { CloudUpload, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCertificateStore } from "../store";

const UploadTemplate = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { state, setTemplate } = useCertificateStore();
    const template = state.template;

    const handleInputChange  = (e : ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.src = url;

        img.onload = () => {
            setTemplate({
                file, 
                url, 
                width: img.width, 
                height: img.height
            });
        };
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const handleDelete = () => {
        if (confirm("Apakah Anda yakin ingin menghapus template ini?")) {
            if (template) URL.revokeObjectURL(template.url);
            setTemplate(null);
        }
    };
    
    return (
        <div className="w-full">
            <input 
                ref={inputRef}
                type="file"
                accept="image/png, image/jpeg"
                className="hidden"
                onChange={handleInputChange}
            />

            {!template ? (
                <div className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-8 text-center">
                <CloudUpload className="mb-3 h-8 w-8 text-muted-foreground" />
    
                <p className="text-sm font-medium text-foreground">
                    Unggah template sertifikat
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Rasio dan transparansi PNG dipertahankan.
                </p>
    
                <Button className="mt-4" onClick={() => inputRef.current?.click()}>Pilih template</Button>
                </div>
            ) : (
                <div className="flex w-full flex-col">
                    <div className="mb-4 flex items-center justify-center rounded-lg border border-border bg-muted/10 p-2">
                        <img
                            src={template.url}
                            alt="Certificate Template Preview"
                            className="max-h-[calc(100vh-28rem)] max-w-full object-contain"
                        />
                    </div>
                    <div className="mb-4 rounded-lg border border-border bg-card p-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">File:</span>
                                <span className="font-medium text-foreground">
                                    {template.file.name}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Dimensi:</span>
                                <span className="font-medium text-foreground">
                                    {template.width} x {template.height} px
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ukuran:</span>
                                <span className="font-medium text-foreground">
                                    {formatFileSize(template.file.size)}
                                </span>
                            </div>
                        </div>
                    </div>
        
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 text-blue-900" onClick={() => inputRef.current?.click()}><RefreshCw className="mr-2 h-4 w-4" /> Ganti</Button>
                        <Button variant="outline" className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete()}><Trash2 className="mr-2 h-4 w-4" />Hapus</Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UploadTemplate;