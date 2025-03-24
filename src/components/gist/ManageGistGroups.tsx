import { GistGroup } from "src/types/types";
import { useGistGroupActions } from "@hooks/gist/useGistGroupActions";
import AddGroupForm from "./AddGroupForm";
import EditDeleteGroupForm from "./EditDeleteGroupForm";

interface ManageGistGroupsProps {
  gistGroups: GistGroup[];
  setGistGroups: React.Dispatch<React.SetStateAction<GistGroup[]>>;
}

export default function ManageGistGroups({ gistGroups, setGistGroups }: ManageGistGroupsProps) {
  const {
    newGroupName,
    setNewGroupName,
    selectedGroupId,
    setSelectedGroupId,
    editGroupName,
    setEditGroupName,
    handleAddGroup,
    handleEditGroup,
    handleDeleteGroup,
  } = useGistGroupActions(gistGroups, setGistGroups);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Manage Gist Groups</h2>
      <AddGroupForm
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        handleAddGroup={handleAddGroup}
      />
      <EditDeleteGroupForm
        gistGroups={gistGroups}
        selectedGroupId={selectedGroupId}
        setSelectedGroupId={setSelectedGroupId}
        editGroupName={editGroupName}
        setEditGroupName={setEditGroupName}
        handleEditGroup={handleEditGroup}
        handleDeleteGroup={handleDeleteGroup}
      />
    </div>
  );
}