import type { DrawUser, User } from '../types';
import { fetchUserProfile } from '../api/twitter';
import { applyUserProfile } from '../utils/replyComments';

const profileCache = new Map<string, User>();
const pendingProfiles = new Map<string, Promise<User>>();

export function useUserProfile() {
  async function loadUserProfile(user: DrawUser): Promise<void> {
    const handle = user.handle.toLowerCase();
    if (user.profileLoaded) return;

    const cached = profileCache.get(handle);
    if (cached) {
      applyUserProfile(user, cached);
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
      applyUserProfile(user, profile);
    } finally {
      pendingProfiles.delete(handle);
    }
  }

  return { loadUserProfile };
}
