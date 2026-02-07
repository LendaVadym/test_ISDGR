/**
 * File Generator Utility
 * Generates random files and file-related operations
 */

class FileGenerator {
  constructor() {
    this.fileCount = 0;
  }

  generateRandomFileName() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `generated_${timestamp}_${random}.txt`;
  }

  createFileMetadata() {
    return {
      name: this.generateRandomFileName(),
      size: Math.floor(Math.random() * 1000000),
      created: new Date(),
      type: this.getRandomFileType(),
    };
  }

  getRandomFileType() {
    const types = ['text', 'binary', 'document', 'image', 'archive'];
    return types[Math.floor(Math.random() * types.length)];
  }

  generateBatch(count = 5) {
    const files = [];
    for (let i = 0; i < count; i++) {
      files.push(this.createFileMetadata());
    }
    return files;
  }
}

module.exports = FileGenerator;
