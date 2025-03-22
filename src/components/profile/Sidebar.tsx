import { FaUser, FaFileCode, FaFolder, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { GistGroup } from "src/types/types";

interface SidebarProps {
  activeTab: "profile";
  setActiveTab: (tab: "profile") => void;
  gistGroups: GistGroup[];
  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;
  isGroupDropdownOpen: boolean;
  setIsGroupDropdownOpen: (open: boolean) => void;
  setShowCreateGist: (show: boolean) => void; // Added
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  gistGroups,
  selectedGroupId,
  setSelectedGroupId,
  isGroupDropdownOpen,
  setIsGroupDropdownOpen,
  setShowCreateGist,
}: SidebarProps) {
  return (
    <>
      {/* Small Devices */}
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col py-3 z-30 sm:hidden">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center justify-center w-full px-2 py-2 mb-1 rounded-lg ${
            activeTab === "profile" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Profile"
        >
          <FaUser className="w-5 h-5 shrink-0" />
        </button>
        <button
          onClick={() => setShowCreateGist(true)}
          className="flex items-center justify-center w-full px-2 py-2 mb-1 rounded-lg text-gray-600 hover:bg-gray-100"
          title="Post Gist"
        >
          <FaFileCode className="w-5 h-5 shrink-0" />
        </button>
        <hr className="w-10 my-2 mx-auto border-gray-300" />
        <button
          onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
          className={`flex items-center justify-center w-full px-2 py-2 mb-1 rounded-lg ${
            isGroupDropdownOpen || selectedGroupId
              ? "text-blue-600 hover:bg-blue-100"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Gist Groups"
        >
          <FaFolder className="w-5 h-5 shrink-0" />
        </button>
      </div>

      {/* Expanded Groups Overlay */}
      {isGroupDropdownOpen && (
        <div className="fixed inset-0 bg-white shadow-lg z-40 flex flex-col py-4 px-4 sm:hidden overflow-y-auto max-h-screen">
          <button
            onClick={() => setIsGroupDropdownOpen(false)}
            className="self-end text-gray-600 hover:text-gray-800 mb-4"
          >
            <FaChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setSelectedGroupId("");
              setIsGroupDropdownOpen(false);
            }}
            className={`flex items-center w-full px-3 py-2 mb-2 text-left text-sm ${
              selectedGroupId === "" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FaFolder className="w-5 h-5 shrink-0 mr-2" />
            All Gists
          </button>
          {gistGroups.length > 0 ? (
            gistGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => {
                  setSelectedGroupId(group.id);
                  setIsGroupDropdownOpen(false);
                }}
                className={`flex items-center w-full px-3 py-2 mb-2 text-left text-sm ${
                  selectedGroupId === group.id
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FaFolder className="w-5 h-5 shrink-0 mr-2" />
                {group.name}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">No groups available</div>
          )}
        </div>
      )}

      {/* Larger Devices */}
      <div className="hidden sm:block w-full max-w-xs bg-white flex flex-col py-4 rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center w-full px-4 py-2 mb-2 rounded-lg ${
            activeTab === "profile" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Profile"
        >
          <FaUser className="w-6 h-6 shrink-0" />
          <span className="ml-2 text-base">Profile</span>
        </button>
        <button
          onClick={() => setShowCreateGist(true)}
          className="flex items-center w-full px-4 py-2 mb-2 rounded-lg text-gray-600 hover:bg-gray-100"
          title="Post Gist"
        >
          <FaFileCode className="w-6 h-6 shrink-0" />
          <span className="ml-2 text-base">Post Gist</span>
        </button>
        <hr className="w-11/12 my-2 mx-auto border-gray-300" />
        <div className="w-full">
          <button
            onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
            className={`flex items-center justify-between w-full px-4 py-2 mb-2 rounded-lg ${
              isGroupDropdownOpen || selectedGroupId
                ? "text-blue-600 hover:bg-blue-100"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Gist Groups"
          >
            <div className="flex items-center">
              <FaFolder className="w-6 h-6 shrink-0" />
              <span className="ml-2 text-base">Groups</span>
            </div>
            {isGroupDropdownOpen ? (
              <FaChevronUp className="w-4 h-4" />
            ) : (
              <FaChevronDown className="w-4 h-4" />
            )}
          </button>
          {isGroupDropdownOpen && (
            <div className="flex flex-col w-full pl-6 max-h-64 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedGroupId("");
                  setIsGroupDropdownOpen(false);
                }}
                className={`flex items-center w-full px-3 py-2 text-left text-sm ${
                  selectedGroupId === "" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FaFolder className="w-5 h-5 shrink-0 mr-2" />
                All Gists
              </button>
              {gistGroups.length > 0 ? (
                gistGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setIsGroupDropdownOpen(false);
                    }}
                    className={`flex items-center w-full px-3 py-2 text-left text-sm ${
                      selectedGroupId === group.id
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <FaFolder className="w-5 h-5 shrink-0 mr-2" />
                    {group.name}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">No groups available</div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}