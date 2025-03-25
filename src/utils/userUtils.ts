import User from '../models/User'; 

export async function getUserAvatar(login: string): Promise<string | null> {
  try {
    const user = await User.findOne({ login }).select('avatar');
    return user?.avatar || null;
  } catch (error) {
    console.error('Error fetching user avatar:', error);
    return null;
  }
}