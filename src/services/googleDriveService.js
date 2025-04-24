import {gapi} from "gapi-script";

// Google API variables
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_FIREBASE_GOOGLE_CLIENT_ID;
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file";

// App folder name in Google Drive
const APP_FOLDER_NAME = "FlowSync Data";

/**
 * Initialize the Google API client
 * This needs to be called before any Drive operations
 */
export const initGoogleDriveApi = async () => {
  return new Promise((resolve, reject) => {
    // Load the Google API client library
    gapi.load('client:auth2', async () => {
      try {
        // Initialize the client with API key and client ID
        await gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        });
        
        console.log('Google Drive API initialized');
        resolve(true);
      } catch (error) {
        console.error('Error initializing Google Drive API:', error);
        reject(error);
      }
    });
  });
};

export const getOrCreateAppFolder = async () => {
  try {
    // Check if folder already exists
    const response = await gapi.client.drive.files.list({
      q: `name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)'
    });

    const files = response.result.files;
    
    // If folder exists, return its ID
    if (files && files.length > 0) {
      console.log('App folder found:', files[0].id);
      return files[0].id;
    }
    
    // Create folder if it doesn't exist
    const fileMetadata = {
      name: APP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    };
    
    const createResponse = await gapi.client.drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    });
    
    console.log('Created app folder with ID:', createResponse.result.id);
    return createResponse.result.id;
  } catch (error) {
    console.error('Error getting/creating app folder:', error);
    throw error;
  }
};


export const saveDataToFile = async (fileName, data, folderId = null) => {
  try {
    if (!folderId) {
      folderId = await getOrCreateAppFolder();
    }
    
    // Check if file already exists in the folder
    const response = await gapi.client.drive.files.list({
      q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)'
    });
    
    const files = response.result.files;
    const content = JSON.stringify(data);
    const blob = new Blob([content], { type: 'application/json' });
    
    if (files && files.length > 0) {
      // Update existing file
      const fileId = files[0].id;
      await gapi.client.request({
        path: `/upload/drive/v3/files/${fileId}`,
        method: 'PATCH',
        params: { uploadType: 'media' },
        body: blob
      });
      
      console.log('File updated:', fileId);
      return fileId;
    } else {
      // Create new file
      const fileMetadata = {
        name: fileName,
        parents: [folderId],
        mimeType: 'application/json'
      };
      
      // Create a new file
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      form.append('file', blob);
      
      // Use fetch API for multipart upload
      const token = gapi.auth.getToken().access_token;
      const result = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ 'Authorization': 'Bearer ' + token }),
        body: form
      });
      
      const responseBody = await result.json();
      console.log('File created:', responseBody.id);
      return responseBody.id;
    }
  } catch (error) {
    console.error('Error saving data to file:', error);
    throw error;
  }
};


export const readDataFromFile = async (fileName, folderId = null) => {
  try {
    if (!folderId) {
      folderId = await getOrCreateAppFolder();
    }
    
    // Find the file
    const response = await gapi.client.drive.files.list({
      q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)'
    });
    
    const files = response.result.files;
    
    if (!files || files.length === 0) {
      console.log('File not found:', fileName);
      return null;
    }
    
    // Get the file content
    const fileId = files[0].id;
    const result = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });
    
    console.log('File content retrieved:', fileId);
    return JSON.parse(result.body);
  } catch (error) {
    console.error('Error reading data from file:', error);
    throw error;
  }
};


export const deleteFile = async (fileName, folderId = null) => {
  try {
    if (!folderId) {
      folderId = await getOrCreateAppFolder();
    }
    
    // Find the file
    const response = await gapi.client.drive.files.list({
      q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)'
    });
    
    const files = response.result.files;
    
    if (!files || files.length === 0) {
      console.log('File not found for deletion:', fileName);
      return false;
    }
    
    // Delete the file
    const fileId = files[0].id;
    await gapi.client.drive.files.delete({
      fileId: fileId
    });
    
    console.log('File deleted:', fileId);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};
