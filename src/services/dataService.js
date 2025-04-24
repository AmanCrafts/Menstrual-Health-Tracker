import { initGoogleDriveApi, saveDataToFile, readDataFromFile, deleteFile } from './googleDriveService';


const USER_PROFILE_FILENAME = 'user_profile.json';
const PERIOD_DATA_FILENAME = 'period_data.json';
const SYMPTOMS_DATA_FILENAME = 'symptoms_data.json';
const NOTES_DATA_FILENAME = 'notes_data.json';


export const initDataService = async () => {
  try {
    // Initialize Google Drive API
    await initGoogleDriveApi();
    console.log('Data service initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize data service:', error);
    throw error;
  }
};


export const saveUserProfile = async (profileData) => {
  try {
    // Add timestamp for when the data was last updated
    const dataToSave = {
      ...profileData,
      lastUpdated: new Date().toISOString()
    };
    
    // Save to Google Drive
    await saveDataToFile(USER_PROFILE_FILENAME, dataToSave);
    console.log('User profile saved successfully');
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};


export const getUserProfile = async () => {
  try {
    // Read from Google Drive
    const profileData = await readDataFromFile(USER_PROFILE_FILENAME);
    return profileData;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};


export const savePeriodData = async (periodData) => {
  try {
    // Add timestamp
    const dataToSave = {
      ...periodData,
      lastUpdated: new Date().toISOString()
    };
    
    // Save to Google Drive
    await saveDataToFile(PERIOD_DATA_FILENAME, dataToSave);
    console.log('Period data saved successfully');
  } catch (error) {
    console.error('Error saving period data:', error);
    throw error;
  }
};


export const getPeriodData = async () => {
  try {
    // Read from Google Drive
    const periodData = await readDataFromFile(PERIOD_DATA_FILENAME);
    return periodData;
  } catch (error) {
    console.error('Error getting period data:', error);
    throw error;
  }
};


export const saveSymptomsData = async (symptomsData) => {
  try {
    // Add timestamp
    const dataToSave = {
      ...symptomsData,
      lastUpdated: new Date().toISOString()
    };
    
    // Save to Google Drive
    await saveDataToFile(SYMPTOMS_DATA_FILENAME, dataToSave);
    console.log('Symptoms data saved successfully');
  } catch (error) {
    console.error('Error saving symptoms data:', error);
    throw error;
  }
};


export const getSymptomsData = async () => {
  try {
    // Read from Google Drive
    const symptomsData = await readDataFromFile(SYMPTOMS_DATA_FILENAME);
    return symptomsData;
  } catch (error) {
    console.error('Error getting symptoms data:', error);
    throw error;
  }
};


export const saveNotesData = async (notesData) => {
  try {
    // Add timestamp
    const dataToSave = {
      ...notesData,
      lastUpdated: new Date().toISOString()
    };
    
    // Save to Google Drive
    await saveDataToFile(NOTES_DATA_FILENAME, dataToSave);
    console.log('Notes data saved successfully');
  } catch (error) {
    console.error('Error saving notes data:', error);
    throw error;
  }
};


export const getNotesData = async () => {
  try {
    // Read from Google Drive
    const notesData = await readDataFromFile(NOTES_DATA_FILENAME);
    return notesData;
  } catch (error) {
    console.error('Error getting notes data:', error);
    throw error;
  }
};


export const exportAllData = async () => {
  try {
    // Collect all user data
    const profile = await getUserProfile() || {};
    const periodData = await getPeriodData() || {};
    const symptomsData = await getSymptomsData() || {};
    const notesData = await getNotesData() || {};
    
    // Combine into a single object
    const allData = {
      profile,
      periodData,
      symptomsData,
      notesData,
      exportDate: new Date().toISOString()
    };
    
    // Create export filename with date
    const date = new Date().toISOString().split('T')[0];
    const exportFilename = `flowsync_export_${date}.json`;
    
    // Save to Google Drive
    const fileId = await saveDataToFile(exportFilename, allData);
    
    console.log('All data exported successfully');
    
    // Return the file ID for download
    return fileId;
  } catch (error) {
    console.error('Error exporting all data:', error);
    throw error;
  }
};


export const deleteAllData = async () => {
  try {
    // Delete each data file
    await deleteFile(USER_PROFILE_FILENAME);
    await deleteFile(PERIOD_DATA_FILENAME);
    await deleteFile(SYMPTOMS_DATA_FILENAME);
    await deleteFile(NOTES_DATA_FILENAME);
    
    console.log('All data deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting all data:', error);
    throw error;
  }
};
