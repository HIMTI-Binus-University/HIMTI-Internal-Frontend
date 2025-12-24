import { FaPlus } from "react-icons/fa6";

const CreateLinkForm = () => {
    return (
        <div className="bg-white rounded-2xl shadow p-8 mb-8">
        <h3 className="text-xl font-bold mb-6">Create New Link</h3>

        <div className="space-y-4">
            <div>
            <label className="block text-sm font-medium mb-1">
                Target Link
            </label>
            <input
                type="text"
                placeholder="www.youtube.com"
                className="w-full border rounded-lg px-4 py-2"
            />
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                    Short Link
                </label>

                <div className="flex rounded-lg overflow-hidden border">
                    {/* Prefix */}
                    <span className="bg-gray-100 text-gray-500 text-sm px-3 flex items-center whitespace-nowrap font-bold">
                    https://himtibinus.or.id/
                    </span>

                    {/* Input */}
                    <input
                    type="text"
                    className="flex-1 px-3 py-2 outline-none"
                    placeholder="ReallyCoolVideos"
                    />
                </div>
            </div>

                <div className="w-64">
                    <label className="block text-sm font-medium mb-1">
                        Expiry Date
                    </label>
                    <input
                        type="datetime-local"
                        className="w-full border rounded-lg px-4 py-2"
                    />
                </div>
            </div>

            <div className="flex justify-end">
            <button className="bg-primary-600 text-white px-5 py-2 rounded-lg flex items-center gap-2">
                <FaPlus /> Create Link
            </button>
            </div>
        </div>
        </div>
    );
};

export default CreateLinkForm;
