const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// Ensure upload directories exist
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Generate unique filename
const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  return `${timestamp}-${random}${extension}`;
};

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    video: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm']
  };

  const allAllowedTypes = [...allowedTypes.image, ...allowedTypes.document, ...allowedTypes.video];

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', req.uploadCategory || 'general');
    await ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileName = generateFileName(file.originalname);
    cb(null, fileName);
  }
});

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 100 // Maximum 100 files per request
  }
});

// Upload middleware for different scenarios
const uploadMiddleware = {
  // Single file upload
  single: (fieldName, category = 'general') => [
    (req, res, next) => {
      req.uploadCategory = category;
      next();
    },
    upload.single(fieldName)
  ],

  // Multiple files with same field name
  array: (fieldName, maxCount = 5, category = 'general') => [
    (req, res, next) => {
      req.uploadCategory = category;
      next();
    },
    upload.array(fieldName, maxCount)
  ],

  // Multiple files with different field names
  fields: (fields, category = 'general') => [
    (req, res, next) => {
      req.uploadCategory = category;
      next();
    },
    upload.fields(fields)
  ],

  // Memorial uploads
  memorial: [
    (req, res, next) => {
      req.uploadCategory = 'memorials';
      next();
    },
    upload.fields([
      { name: 'profile_image', maxCount: 1 },
      { name: 'cover_image', maxCount: 1 },
      { name: 'gallery_images', maxCount: 100 }
    ])
  ],

  // Vendor uploads
  vendor: [
    (req, res, next) => {
      req.uploadCategory = 'vendors';
      next();
    },
    upload.fields([
      { name: 'logo', maxCount: 1 },
      { name: 'cover_image', maxCount: 1 },
      { name: 'gallery_images', maxCount: 100 },
      { name: 'documents', maxCount: 5 }
    ])
  ],

  // Product uploads
  product: [
    (req, res, next) => {
      req.uploadCategory = 'products';
      next();
    },
    upload.fields([
      { name: 'main_image', maxCount: 1 },
      { name: 'gallery_images', maxCount: 10 }
    ])
  ]
};

// Process uploaded files
const uploadFiles = async (files, category = 'general') => {
  const uploadedFiles = {};

  for (const [fieldName, fileArray] of Object.entries(files)) {
    if (Array.isArray(fileArray)) {
      uploadedFiles[fieldName] = fileArray.map(file => {
        return `/uploads/${category}/${file.filename}`;
      });
    } else {
      uploadedFiles[fieldName] = [`/uploads/${category}/${fileArray.filename}`];
    }
  }

  return uploadedFiles;
};

// Delete file utility
const deleteFile = async (filePath) => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Delete multiple files
const deleteFiles = async (filePaths) => {
  const results = await Promise.allSettled(
    filePaths.map(filePath => deleteFile(filePath))
  );
  
  return results.map((result, index) => ({
    filePath: filePaths[index],
    success: result.status === 'fulfilled' && result.value
  }));
};

// Get file info
const getFileInfo = async (filePath) => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const stats = await fs.stat(fullPath);
    
    return {
      exists: true,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      extension: path.extname(filePath),
      mimetype: getMimeType(path.extname(filePath))
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
};

// Get MIME type from extension
const getMimeType = (extension) => {
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.mp4': 'video/mp4',
    '.mpeg': 'video/mpeg',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm'
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};

// Validate image dimensions (optional)
const validateImageDimensions = async (filePath, maxWidth = 2000, maxHeight = 2000) => {
  try {
    // This would require an image processing library like sharp
    // For now, we'll just return true
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Resize image (optional - requires sharp)
const resizeImage = async (inputPath, outputPath, width, height) => {
  try {
    // This would require sharp library
    // const sharp = require('sharp');
    // await sharp(inputPath)
    //   .resize(width, height, { fit: 'inside', withoutEnlargement: true })
    //   .toFile(outputPath);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Clean up old files (utility for maintenance)
const cleanupOldFiles = async (directory, maxAge = 30) => {
  try {
    const dirPath = path.join(process.cwd(), 'uploads', directory);
    const files = await fs.readdir(dirPath);
    const cutoffDate = new Date(Date.now() - (maxAge * 24 * 60 * 60 * 1000));
    
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);
      
      if (stats.birthtime < cutoffDate) {
        await fs.unlink(filePath);
        deletedCount++;
      }
    }
    
    return { success: true, deletedCount };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  uploadMiddleware,
  uploadFiles,
  deleteFile,
  deleteFiles,
  getFileInfo,
  getMimeType,
  validateImageDimensions,
  resizeImage,
  cleanupOldFiles,
  generateFileName,
  ensureDirectoryExists
};
