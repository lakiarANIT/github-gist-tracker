import { GistFile, NewGist } from "src/types/types";

export function useFileManagement(newGist: NewGist, setNewGist: (gist: NewGist) => void) {
  const handleAddFile = () => {
    setNewGist({
      ...newGist,
      files: [...newGist.files, { filename: "", content: "", language: "Text" }],
    });
  };

  const handleDeleteFile = (index: number) => {
    if (newGist.files.length <= 1) {
      alert("You must keep at least one file.");
      return;
    }
    const updatedFiles = newGist.files.filter((_, i) => i !== index);
    setNewGist({ ...newGist, files: updatedFiles });
  };

  const handleFileChange = (index: number, field: keyof GistFile, value: string) => {
    const updatedFiles = newGist.files.map((file, i) =>
      i === index ? { ...file, [field]: value } : file
    );
    setNewGist({ ...newGist, files: updatedFiles });
  };

  return { handleAddFile, handleDeleteFile, handleFileChange };
}