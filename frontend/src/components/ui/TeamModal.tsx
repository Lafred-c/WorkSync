import {useState, useEffect} from "react";
import {X, Upload, Image as ImageIcon} from "lucide-react";
import {compressImage} from "../../utils/imageCompression";

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreate: (team: {
    name: string;
    description: string;
    image?: string | null;
  }) => void;
  editTeam?: {
    _id: string;
    name: string;
    description?: string;
    image?: string | null;
  } | null;
  onTeamUpdate?: (team: {
    _id: string;
    name: string;
    description: string;
    image?: string | null;
  }) => void;
}

const TeamModal = ({
  isOpen,
  onClose,
  onTeamCreate,
  editTeam,
  onTeamUpdate,
}: TeamModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editTeam) {
      setName(editTeam.name);
      setDescription(editTeam.description || "");
      setImagePreview(editTeam.image || null);
      setImageData(editTeam.image || null);
    } else {
      setName("");
      setDescription("");
      setImagePreview(null);
      setImageData(null);
    }
    setError(null);
  }, [editTeam, isOpen]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (5MB max before compression)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError("Image size must be less than 5MB");
      return;
    }

    setError(null);
    setIsCompressing(true);

    try {
      // Compress image to max 400x400 with 0.7 quality
      const compressedBase64 = await compressImage(file, 400, 400, 0.7);
      setImagePreview(compressedBase64);
      setImageData(compressedBase64);
    } catch (err) {
      setError("Failed to process image. Please try another file.");
      console.error("Image compression error:", err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageData(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editTeam && onTeamUpdate) {
      // Update existing team
      const updatedTeam = {
        _id: editTeam._id,
        name,
        description,
        image: imageData, // Send explicit null if removed
      };
      onTeamUpdate(updatedTeam);
    } else {
      // Create new team
      const newTeam = {
        name,
        description,
        image: imageData, // Send explicit null if removed
      };
      onTeamCreate(newTeam);
    }
    handleClose();
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setImagePreview(null);
    setImageData(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
      <div
        className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl w-full max-w-md"
        style={{
          animation: "slideUp 0.3s ease-out",
          transition: "all 0.3s ease-out",
        }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editTeam ? "Edit Team" : "Create New Team"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Team Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Team Image
            </label>
            <div className="flex items-center gap-4">
              {/* Image Preview */}
              <div className="relative">
                {imagePreview ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-700">
                    <img
                      src={imagePreview}
                      alt="Team preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="team-image"
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors w-full sm:w-auto ${
                      isCompressing
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}>
                    <Upload size={16} />
                    {isCompressing
                      ? "Compressing..."
                      : imagePreview
                        ? "Change Image"
                        : "Upload Image"}
                  </label>

                  {imagePreview && !isCompressing && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-red-200 dark:border-red-900/30 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full sm:w-auto cursor-pointer">
                      <X size={16} />
                      Remove Image
                    </button>
                  )}
                </div>

                <input
                  id="team-image"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  disabled={isCompressing}
                  className="hidden"
                />
              </div>
            </div>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          </div>

          {/* Team Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-zinc-900 dark:text-white"
              placeholder="Enter team name"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {name.length}/20 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={20}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white dark:bg-zinc-900 dark:text-white"
              placeholder="Enter team description"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/20 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose} 
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
              {editTeam ? "Update Team" : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamModal;
