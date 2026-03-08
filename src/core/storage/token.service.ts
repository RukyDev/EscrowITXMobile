import EncryptedStorage from 'react-native-encrypted-storage';

const TOKEN_KEY = 'ACCESS_TOKEN';

export const tokenService = {
  async save(token: string) {
    await EncryptedStorage.setItem(TOKEN_KEY, token);
  },

  async get(): Promise<string | null> {
    return await EncryptedStorage.getItem(TOKEN_KEY);
  },

  async clear() {
    await EncryptedStorage.removeItem(TOKEN_KEY);
  },

  // TODO: Add refreshToken
};