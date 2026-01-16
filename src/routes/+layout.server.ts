import { env } from "$env/dynamic/private";

export function load() {
  return {
    ghostUrl: env.GHOST_API_URL || env.GHOST_URL || ""
  };
}

