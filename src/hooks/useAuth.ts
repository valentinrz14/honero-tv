import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  loginWithCode,
  validateSession,
  getStoredSession,
  clearSession,
} from '@/lib/api';

export const authKeys = {
  session: ['auth', 'session'] as const,
  validation: ['auth', 'validation'] as const,
};

/** Check if there's a stored (local) session */
export function useStoredSession() {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: getStoredSession,
    staleTime: Infinity,
  });
}

/** Validate stored session against the server */
export function useValidateSession(enabled = true) {
  return useQuery({
    queryKey: authKeys.validation,
    queryFn: validateSession,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/** Login mutation */
export function useLogin() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: loginWithCode,
    onSuccess: () => {
      qc.invalidateQueries({queryKey: authKeys.session});
      qc.invalidateQueries({queryKey: authKeys.validation});
    },
  });
}

/** Logout mutation */
export function useLogout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: clearSession,
    onSuccess: () => {
      qc.invalidateQueries({queryKey: authKeys.session});
      qc.invalidateQueries({queryKey: authKeys.validation});
    },
  });
}
