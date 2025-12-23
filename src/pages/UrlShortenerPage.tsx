import React from "react";
import Sidebar from "../components/Sidebar";

const UrlShortenerPage = () => {
  return (
    <div className="flex min-h-screen w-full bg-[#f3f4f6]">
      {/* 1. Sidebar Buatan Lu */}
      <Sidebar />

      {/* 2. Area Kanan (Tempat Kerja Temen Lu) */}
      <main className="flex-1 ml-[260px] p-10 font-public-sans">
        {/* Header Sementara */}
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">URL Shortener</h2>
          <div className="text-sm text-gray-600">User: Daffa Fayyaz</div>
        </header>

        {/* Kotak Kosong (Placeholder) */}
        <div className="border-4 border-dashed border-blue-300 bg-blue-50 rounded-xl h-[60vh] flex flex-col items-center justify-center text-blue-800 gap-4">
          <h3 className="text-xl font-bold">Area Form & List</h3>
          <p>Bro, ini area lu ya. Coding form-nya taro disini.</p>
        </div>
      </main>
    </div>
  );
};

export default UrlShortenerPage;
