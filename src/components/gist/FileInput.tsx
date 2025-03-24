import { FaTrash } from "react-icons/fa";
import { Gist, GistFile } from "src/types/types";

interface FileInputProps {
  file: GistFile;
  index: number;
  isEditing: boolean;
  gists: Gist[];
  linkedGist: string | null;
  setLinkedGist: (id: string | null) => void;
  handleFileChange: (index: number, field: keyof GistFile, value: string) => void;
  handleDeleteFile: (index: number) => void;
}

export default function FileInput({
  file,
  index,
  isEditing,
  gists,
  linkedGist,
  setLinkedGist,
  handleFileChange,
  handleDeleteFile,
}: FileInputProps) {
  return (
    <div className="mb-4 border-b pb-4 border-gray-200 dark:border-gray-700 relative">
      <input
        type="text"
        placeholder={`File ${index + 1} filename (e.g., file${index + 1}.txt)`}
        value={file.filename}
        onChange={(e) => handleFileChange(index, "filename", e.target.value)}
        className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />
      <textarea
        placeholder={`Content for File ${index + 1}...`}
        value={file.content}
        onChange={(e) => handleFileChange(index, "content", e.target.value)}
        className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        rows={4}
      />
      <div className="flex items-center gap-2 mb-2">
        <select
          value={file.language}
          onChange={(e) => handleFileChange(index, "language", e.target.value)}
          className="p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          {["Text", "Ruby", "Python", "JavaScript", "TypeScript"].map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        {!isEditing && index === 0 && (
          <select
            value={linkedGist || ""}
            onChange={(e) => setLinkedGist(e.target.value || null)}
            className="p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">Link to another Gist (optional)</option>
            {gists.map((gist) => (
              <option key={gist.id} value={gist.id}>
                {gist.description || "Untitled Gist"}
              </option>
            ))}
          </select>
        )}
      </div>
      <button
        type="button"
        onClick={() => handleDeleteFile(index)}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        title="Delete this file"
        disabled={index === 0 && file.filename === "" && file.content === ""}
      >
        <FaTrash className="w-4 h-4" />
      </button>
    </div>
  );
}