
import { useFetchCsrfTokenQuery } from '../state/api/csrfApi';

export const useCsrfToken = () => {
  const { data, refetch, error } = useFetchCsrfTokenQuery();
  const getToken = async (): Promise<string | undefined> => {
    try {
      if (!data?.csrfToken) {
        const res = await refetch();
        if (res.error) throw res.error;
        return res.data?.csrfToken;
      }
      return data?.csrfToken;
    } catch (err) {
      console.error('Error fetching CSRF token:', err);
      return undefined;
    }
  };
  return { getToken, error };
};