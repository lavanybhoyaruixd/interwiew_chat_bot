// Cloud Storage Service for Resume Files
// Supports AWS S3, Google Cloud Storage, and Azure Blob Storage

const AWS = require('aws-sdk');
const { Storage } = require('@google-cloud/storage');
const { BlobServiceClient } = require('@azure/storage-blob');
const logger = require('../utils/logger');

class CloudStorageService {
  constructor() {
    this.provider = process.env.CLOUD_STORAGE_PROVIDER || 'local'; // 'aws', 'gcp', 'azure', 'local'
    this.bucket = process.env.CLOUD_STORAGE_BUCKET;
    this.region = process.env.CLOUD_STORAGE_REGION || 'us-east-1';
    
    this.initializeProvider();
  }

  initializeProvider() {
    switch (this.provider) {
      case 'aws':
        this.s3 = new AWS.S3({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: this.region
        });
        break;
        
      case 'gcp':
        this.gcs = new Storage({
          projectId: process.env.GCP_PROJECT_ID,
          keyFilename: process.env.GCP_KEY_FILE
        });
        this.gcsBucket = this.gcs.bucket(this.bucket);
        break;
        
      case 'azure':
        this.blobService = BlobServiceClient.fromConnectionString(
          process.env.AZURE_STORAGE_CONNECTION_STRING
        );
        this.containerClient = this.blobService.getContainerClient(this.bucket);
        break;
        
      default:
        logger.info('Using local storage for resume files');
    }
  }

  // Upload file to cloud storage
  async uploadFile(fileBuffer, fileName, metadata = {}) {
    try {
      const key = this.generateStorageKey(fileName);
      
      switch (this.provider) {
        case 'aws':
          return await this.uploadToS3(fileBuffer, key, metadata);
        case 'gcp':
          return await this.uploadToGCS(fileBuffer, key, metadata);
        case 'azure':
          return await this.uploadToAzure(fileBuffer, key, metadata);
        default:
          throw new Error('Cloud storage not configured');
      }
    } catch (error) {
      logger.error('Cloud upload error:', error);
      throw error;
    }
  }

  // Upload to AWS S3
  async uploadToS3(fileBuffer, key, metadata) {
    const params = {
      Bucket: this.bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: 'application/pdf',
      Metadata: metadata,
      ServerSideEncryption: 'AES256'
    };

    const result = await this.s3.upload(params).promise();
    logger.info(`File uploaded to S3: ${key}`);
    
    return {
      url: result.Location,
      key: result.Key,
      etag: result.ETag,
      provider: 'aws'
    };
  }

  // Upload to Google Cloud Storage
  async uploadToGCS(fileBuffer, key, metadata) {
    const file = this.gcsBucket.file(key);
    
    await file.save(fileBuffer, {
      metadata: {
        contentType: 'application/pdf',
        metadata: metadata
      }
    });

    logger.info(`File uploaded to GCS: ${key}`);
    
    return {
      url: `gs://${this.bucket}/${key}`,
      key: key,
      provider: 'gcp'
    };
  }

  // Upload to Azure Blob Storage
  async uploadToAzure(fileBuffer, key, metadata) {
    const blockBlobClient = this.containerClient.getBlockBlobClient(key);
    
    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
      blobHTTPHeaders: { blobContentType: 'application/pdf' },
      metadata: metadata
    });

    logger.info(`File uploaded to Azure: ${key}`);
    
    return {
      url: blockBlobClient.url,
      key: key,
      provider: 'azure'
    };
  }

  // Delete file from cloud storage
  async deleteFile(key) {
    try {
      switch (this.provider) {
        case 'aws':
          await this.s3.deleteObject({ Bucket: this.bucket, Key: key }).promise();
          break;
        case 'gcp':
          await this.gcsBucket.file(key).delete();
          break;
        case 'azure':
          await this.containerClient.deleteBlob(key);
          break;
      }
      
      logger.info(`File deleted from cloud: ${key}`);
    } catch (error) {
      logger.error('Cloud delete error:', error);
      throw error;
    }
  }

  // Generate storage key/path
  generateStorageKey(fileName) {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    return `resumes/${timestamp}_${randomSuffix}_${sanitizedName}`;
  }

  // Get signed URL for temporary access
  async getSignedUrl(key, expiresIn = 3600) {
    try {
      switch (this.provider) {
        case 'aws':
          return this.s3.getSignedUrl('getObject', {
            Bucket: this.bucket,
            Key: key,
            Expires: expiresIn
          });
          
        case 'gcp':
          const [url] = await this.gcsBucket.file(key).getSignedUrl({
            action: 'read',
            expires: Date.now() + (expiresIn * 1000)
          });
          return url;
          
        case 'azure':
          // Azure signed URL implementation
          const blockBlobClient = this.containerClient.getBlockBlobClient(key);
          return blockBlobClient.url; // Simplified - implement proper SAS token
          
        default:
          throw new Error('Signed URLs not supported for local storage');
      }
    } catch (error) {
      logger.error('Signed URL error:', error);
      throw error;
    }
  }
}

module.exports = new CloudStorageService();
