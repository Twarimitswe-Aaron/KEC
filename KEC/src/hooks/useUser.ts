import { useEffect, useState } from "react";
import { useGetUserQuery, useLogoutMutation } from "../state/api/authApi";
import { toast } from "react-toastify";

export const useUser = () => {
  const { data, error, isLoading, refetch } = useGetUserQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 60_000, // auto-refetch every 1 min
  });

  const [logoutUser] = useLogoutMutation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logout, setLogout] = useState(false);

  // Handle unauthorized
  useEffect(() => {
    if (!isLoading && !data && !logout) {
      logoutUser();
      setLogout(true);
      window.location.href = "/login";
    }
  }, [isLoading, data, logout, logoutUser]);

  // Handle email not verified
  useEffect(() => {
    if (data && !data.isEmailVerified) {
      toast.error("Your email is not verified. Please check your email!", {
        autoClose: 5000,
      });
    }
  }, [data]);

  // Optional: refetch whenever data object changes deeply
  useEffect(() => {
    if (data) {
      // Example condition: if profile updatedAt changes, refetch
      refetch();
    }
  }, [data?.profile?.updatedAt, refetch]);

  return {
    userData: data || null,
    isLoading: isLoading || isRefreshing,
    error,
    refetchUser: async () => {
      setIsRefreshing(true);
      await refetch();
      setIsRefreshing(false);
    },
  };
};
