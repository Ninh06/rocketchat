export const decodeJwt = (token) => {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload)); // Decode base64 payload
      return decodedPayload;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };
  