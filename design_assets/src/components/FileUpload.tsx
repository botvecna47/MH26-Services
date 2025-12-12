// Advanced file upload component with drag & drop, preview, and progress
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Progress
} from 'lucide-react';
import { Button } from './ui/button';
import { Progress as ProgressBar } from './ui/progress';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner@2.0.3';

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  progress?: number;
  status?: 'uploading' | 'success' | 'error';
  error?: string;
}

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  onFilesSelected?: (files: FileWithPreview[]) => void;
  onFileRemoved?: (fileId: string) => void;
  onUploadComplete?: (files: FileWithPreview[]) => void;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  uploadEndpoint?: string;
}

export function FileUpload({
  accept = "image/*,.pdf,.doc,.docx",
  multiple = true,
  maxSize = 5, // 5MB default
  maxFiles = 10,
  onFilesSelected,
  onFileRemoved,
  onUploadComplete,
  className = "",
  disabled = false,
  showPreview = true,
  uploadEndpoint = "/api/upload"
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileId = () => Math.random().toString(36).substr(2, 9);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.includes('pdf')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Size validation
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Type validation
    if (accept && accept !== "*") {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type;

      const isValid = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type;
        }
        if (type.includes('/*')) {
          return mimeType.startsWith(type.replace('/*', ''));
        }
        return mimeType === type;
      });

      if (!isValid) {
        return `File type not allowed. Accepted types: ${accept}`;
      }
    }

    return null;
  };

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const processFiles = async (fileList: FileList) => {
    const newFiles: FileWithPreview[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Check file count limit
      if (files.length + newFiles.length >= maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        break;
      }

      // Validate file
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }

      // Create file with preview
      const fileWithPreview: FileWithPreview = Object.assign(file, {
        id: generateFileId(),
        preview: await createFilePreview(file),
        progress: 0,
        status: 'uploading' as const,
      });

      newFiles.push(fileWithPreview);
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesSelected?.(newFiles);
      
      // Auto-upload if endpoint provided
      if (uploadEndpoint) {
        uploadFiles(newFiles);
      }
    }
  };

  const uploadFiles = async (filesToUpload: FileWithPreview[]) => {
    setUploading(true);
    
    try {
      for (const file of filesToUpload) {
        await uploadSingleFile(file);
      }
      
      onUploadComplete?.(filesToUpload);
      toast.success('All files uploaded successfully!');
    } catch (error) {
      toast.error('Some files failed to upload');
    } finally {
      setUploading(false);
    }
  };

  const uploadSingleFile = async (file: FileWithPreview): Promise<void> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      // Progress tracking
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          updateFileProgress(file.id, progress);
        }
      });

      // Success handler
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          updateFileStatus(file.id, 'success');
          resolve();
        } else {
          updateFileStatus(file.id, 'error', 'Upload failed');
          reject(new Error('Upload failed'));
        }
      });

      // Error handler
      xhr.addEventListener('error', () => {
        updateFileStatus(file.id, 'error', 'Network error');
        reject(new Error('Network error'));
      });

      // Send request
      xhr.open('POST', uploadEndpoint);
      xhr.send(formData);
    });
  };

  const updateFileProgress = (fileId: string, progress: number) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, progress } : file
    ));
  };

  const updateFileStatus = (fileId: string, status: FileWithPreview['status'], error?: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, status, error, progress: status === 'success' ? 100 : file.progress } : file
    ));
  };

  const removeFile = (fileId: string) => {
    const fileToRemove = files.find(f => f.id === fileId);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    setFiles(prev => prev.filter(f => f.id !== fileId));
    onFileRemoved?.(fileId);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [files.length, maxFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-lg p-8 transition-all duration-200
          ${dragActive 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-border hover:border-primary/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={disabled ? undefined : openFileDialog}
        whileHover={!disabled ? { scale: 1.01 } : undefined}
        whileTap={!disabled ? { scale: 0.99 } : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <motion.div
            className={`w-16 h-16 rounded-full flex items-center justify-center
              ${dragActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}
            `}
            animate={dragActive ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3, repeat: dragActive ? Infinity : 0 }}
          >
            <Upload className="w-8 h-8" />
          </motion.div>

          <div className="text-center">
            <p className="font-medium text-foreground">
              {dragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {accept === 'image/*' ? 'Images only' : 'Files up to'} {maxSize}MB
            </p>
            {multiple && (
              <p className="text-xs text-muted-foreground mt-1">
                Maximum {maxFiles} files
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">
                Uploaded Files ({files.length})
              </h4>
              {files.length > 0 && !uploading && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFiles([])}
                  className="text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid gap-2">
              {files.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        {/* File Preview/Icon */}
                        <div className="flex-shrink-0">
                          {showPreview && file.preview ? (
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                              {(() => {
                                const Icon = getFileIcon(file);
                                return <Icon className="w-5 h-5 text-muted-foreground" />;
                              })()}
                            </div>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{file.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </span>
                            
                            {/* Status Badge */}
                            {file.status && (
                              <Badge 
                                variant={
                                  file.status === 'success' ? 'default' :
                                  file.status === 'error' ? 'destructive' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {file.status === 'uploading' && <Progress className="w-3 h-3 mr-1 animate-spin" />}
                                {file.status === 'success' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {file.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                                {file.status}
                              </Badge>
                            )}
                          </div>

                          {/* Progress Bar */}
                          {file.status === 'uploading' && file.progress !== undefined && (
                            <ProgressBar value={file.progress} className="mt-2 h-1" />
                          )}

                          {/* Error Message */}
                          {file.status === 'error' && file.error && (
                            <p className="text-xs text-destructive mt-1">{file.error}</p>
                          )}
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          disabled={uploading}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FileUpload;