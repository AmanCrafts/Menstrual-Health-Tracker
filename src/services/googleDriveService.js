import {gapi} from "gapi-script";

// this is where we save our stuff, I called it FlowSync Data!
const APP_FOLDER_NAME = "FlowSync Data";

// this stores the login token thingy we get
let accessToken = null;

/**
 * this function saves the token we got from google login
 * so we can use google drive later :)
 */
export const setAccessToken = (token) => {
  if (!token) {
    console.warn('Attempted to set null or undefined access token');
    return;
  }
  
  accessToken = token;
  console.log('Access token set for Google Drive API:', token.substring(0, 10) + '...');
};

/**
 * Check if the current token appears to be valid
 * (Note: This doesn't actually validate with Google, just checks if it looks like a token)
 */
export const hasValidToken = () => {
  return !!accessToken && typeof accessToken === 'string' && accessToken.length > 20;
};

/**
 * this starts the google drive connection
 * call this before trying to save any files!!
 */
export const initGoogleDriveApi = async () => {
  try {
    // First check if we have what looks like a valid token
    if (!hasValidToken()) {
      console.warn('No valid access token available. Drive operations will fail. Token:', accessToken);
      return false;
    }
    
    console.log('Initializing with token starting with:', accessToken.substring(0, 10) + '...');
    
    // Load the Google API client
    await loadGoogleApi();
    
    // Set the auth token for all requests
    gapi.client.setToken({ access_token: accessToken });
    
    // Do a simple test request to verify the token works
    try {
      console.log('Testing token with a simple API request...');
      await gapi.client.drive.about.get({
        fields: 'user'
      });
      console.log('Google Drive API initialized with token - token validated');
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      accessToken = null; // Clear invalid token
      return false;
    }
  } catch (error) {
    console.error('Error initializing Google Drive API:', error);
    throw error;
  }
};

/**
 * this creates our app folder or finds it if it exists already
 * returns the folder ID which is like a special code for the folder
 */
export const getOrCreateAppFolder = async () => {
  try {
    if (!accessToken) {
      throw new Error('No access token available for Drive operations');
    }
    
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

/**
 * this saves data to a file in google drive
 * i was confused about all these parameters but they work now
 */
export const saveDataToFile = async (fileName, data, folderId = null) => {
  try {
    if (!accessToken) {
      throw new Error('No access token available for Drive operations');
    }
    
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
      
      // Use fetch for direct media upload (more reliable than gapi for binary data)
      const result = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: new Headers({
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        }),
        body: blob
      });
      
      if (!result.ok) {
        throw new Error(`Failed to update file: ${result.status} ${result.statusText}`);
      }
      
      console.log('File updated:', fileId);
      return fileId;
    } else {
      // Create new file
      const fileMetadata = {
        name: fileName,
        parents: [folderId],
        mimeType: 'application/json'
      };
      
      // Create a new file using multipart upload
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      form.append('file', blob);
      
      const result = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
        body: form
      });
      
      if (!result.ok) {
        throw new Error(`Failed to create file: ${result.status} ${result.statusText}`);
      }
      
      const responseBody = await result.json();
      console.log('File created:', responseBody.id);
      return responseBody.id;
    }
  } catch (error) {
    console.error('Error saving data to file:', error);
    throw error;
  }
};

/**
 * this reads data from a file in google drive
 * it might return null if the file doesn't exist yet!
 */
export const readDataFromFile = async (fileName, folderId = null) => {
  try {
    if (!accessToken) {
      throw new Error('No access token available for Drive operations');
    }
    
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
    
    // Get the file content using fetch (more reliable than gapi for binary responses)
    const fileId = files[0].id;
    const result = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: new Headers({ 'Authorization': 'Bearer ' + accessToken })
    });
    
    if (!result.ok) {
      throw new Error(`Failed to read file: ${result.status} ${result.statusText}`);
    }
    
    const content = await result.json();
    console.log('File content retrieved:', fileId);
    return content;
  } catch (error) {
    console.error('Error reading data from file:', error);
    throw error;
  }
};

/**
 * this deletes a file from google drive
 * be careful with this!! it permanently removes things
 */
export const deleteFile = async (fileName, folderId = null) => {
  try {
    if (!accessToken) {
      throw new Error('No access token available for Drive operations');
    }
    
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
    const result = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: new Headers({ 'Authorization': 'Bearer ' + accessToken })
    });
    
    if (!result.ok) {
      throw new Error(`Failed to delete file: ${result.status} ${result.statusText}`);
    }
    
    console.log('File deleted:', fileId);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * this loads the google api stuff
 * i'm not sure how it works but i found it on stackoverflow
 */
export const loadGoogleApi = () => {
  return new Promise((resolve, reject) => {
    const waitForGapi = (retries = 0, maxRetries = 10) => {
      if (typeof gapi !== 'undefined') {
        // GAPI is loaded, proceed to load the client
        gapi.load('client', async () => {
          try {
            await gapi.client.init({
              discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
            });
            console.log('Google API client loaded');
            resolve(true);
          } catch (error) {
            console.error('Error initializing Google API client:', error);
            reject(error);
          }
        });
      } else if (retries < maxRetries) {
        // GAPI not loaded yet, wait and retry
        console.log(`Waiting for GAPI to load (attempt ${retries + 1}/${maxRetries})...`);
        setTimeout(() => waitForGapi(retries + 1, maxRetries), 1000);
      } else {
        // Giving up after max retries
        console.error('Google API (gapi) not available after maximum retries');
        reject(new Error('Google API not available'));
      }
    };
    
    // Start waiting for GAPI
    waitForGapi();
  });
};
