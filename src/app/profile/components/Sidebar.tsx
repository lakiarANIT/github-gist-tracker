import { FaUser, FaFileCode, FaFolder } from "react-icons/fa";
import { GistGroup, ActiveTab } from "../types";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  gistGroups: GistGroup[];
  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;
  isGroupDropdownOpen: boolean;
  setIsGroupDropdownOpen: (open: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  gistGroups,
  selectedGroupId,
  setSelectedGroupId,
  isGroupDropdownOpen,
  setIsGroupDropdownOpen,
}: SidebarProps) {
  return (
    <div className="w-16 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col items-center py-4 sticky top-6 h-fit">
      <button
        onClick={() => setActiveTab("profile")}
        className={`p-3 mb-2 rounded-full ${
          activeTab === "profile" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
        }`}
        title="Profile"
      >
        <FaUser className="w-6 h-6" />
      </button>
      <button
        onClick={() => setActiveTab("postGist")}
        className={`p-3 mb-2 rounded-full ${
          activeTab === "postGist" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
        }`}
        title="Post Gist"
      >
        <FaFileCode className="w-6 h-6" />
      </button>
      <hr className="w-10 my-2 border-gray-300" />
      <div className="relative">
        <button
          onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
          className={`p-3 mb-2 rounded-full ${
            selectedGroupId ? "text-blue-600 hover:bg-blue-100" : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Gist Groups"
        >
          <FaFolder className="w-6 h-6" />
        </button>
        {isGroupDropdownOpen && (
          <div className="absolute left-16 top-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <button
              onClick={() => {
                setSelectedGroupId("");
                setIsGroupDropdownOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm ${
                selectedGroupId === "" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All Gists
            </button>
            {gistGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => {
                  setSelectedGroupId(group.id);
                  setIsGroupDropdownOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm ${
                  selectedGroupId === group.id
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}