import type { DrawUser, User } from '../types';
import { fetchUserProfile } from '../api/twitter';

const profileCache = new Map<string, User>();
const pendingProfiles = new Map<string, Promise<User>>();

export function useUserProfile() {
  async function loadUserProfile(user: DrawUser): Promise<void> {
    const handle = user.handle.toLowerCase();
    if (user.profileLoaded) return;

    const cached = profileCache.get(handle);
    if (cached) {
      Object.assign(user, cached, { profileLoaded: true });
      return;
    }

    let pending = pendingProfiles.get(handle);
    if (!pending) {
      pending = fetchUserProfile(user.handle);
      pendingProfiles.set(handle, pending);
    }

    try {
      const profile = await pending;
      profileCache.set(handle, profile);
      Object.assign(user, profile, { profileLoaded: true });
    } finally {
      pendingProfiles.delete(handle);
    }
  }

  return { loadUserProfile };
}
