import {
    FaSearch,
    FaRegCopy,
    FaPencilAlt,
    FaTrashAlt,
    FaCalendarAlt,
    FaArrowRight,
} from "react-icons/fa";

const ExistingLink = () => {
    return (
        <div className="bg-white rounded-2xl shadow p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Existing Links</h3>

            <div className="flex gap-3">
            <input
                type="text"
                placeholder="Search..."
                className="border rounded-lg px-4 py-2 w-64 text-sm"
            />
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                <FaSearch />
                Search
            </button>
            </div>
        </div>

        {/* List */}
        <div className="space-y-4">
            {[1, 2].map((item) => (
            <div
                key={item}
                className="border rounded-xl p-5 flex justify-between items-start hover:shadow-md transition-shadow"
            >
                <div className="space-y-2">
                <p className="font-semibold text-gray-800">
                    himtibinus.or.id/
                    <span className="font-bold">ReallyCoolVideos</span>
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaArrowRight />
                    <span>www.youtube.com</span>
                </div>

                <div className="flex items-center gap-6 text-xs text-gray-400 mt-2">
                    <div className="flex items-center gap-2">
                    <FaCalendarAlt />
                    Created on 20 December, 2025
                    </div>

                    <div className="flex items-center gap-2">
                    <FaCalendarAlt />
                    Expires on 21 December, 2025, 23:59:59
                    </div>
                </div>
                </div>

                <div className="flex items-center gap-3 text-gray-400">
                <button className="hover:text-indigo-600 transition-colors">
                    <FaRegCopy />
                </button>
                <button className="hover:text-yellow-500 transition-colors">
                    <FaPencilAlt />
                </button>
                <button className="hover:text-red-500 transition-colors">
                    <FaTrashAlt />
                </button>
                </div>
            </div>
            ))}
        </div>
        </div>
    );
};

export default ExistingLink;
