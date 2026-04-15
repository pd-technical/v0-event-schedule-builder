
import {
  FaPaw, FaBug, FaFlask, FaPaintbrush, FaMusic, FaUtensils, FaInfo, FaFish,
  FaGamepad, FaLeaf, FaHorse, FaEgg, FaCat, FaTractor, FaScissors, FaChess, FaBook, FaRobot, FaSeedling, FaCloudSun
} from "react-icons/fa6"
import { FaMapMarkerAlt } from "react-icons/fa";
import { PiMicrophoneStageFill } from "react-icons/pi";
import { getCategoryIcon } from "@/app/lib/eventUtils"
import type { Event, ScheduledEvent } from "@/app/page"

const ICON_MAP: Record<string, React.ElementType> = {
  horse:       FaHorse,
  bug:         FaBug,
  cat:         FaCat,
  leaf:        FaLeaf,
  sun:         FaSeedling,
  fish:        FaFish,
  music:       FaMusic,
  art:         FaPaintbrush,
  paw:         FaPaw,
  flask:       FaFlask,
  robot:       FaRobot,
  gamepad:     FaGamepad,
  book:        FaBook,
  microphone:  PiMicrophoneStageFill,
  utensils:    FaUtensils,
  scissors:    FaScissors,
  cloudSun:    FaCloudSun,
  games:       FaChess,
  tractor:     FaTractor,
  info:        FaInfo,
  pin:         FaMapMarkerAlt,
}

export function CategoryIcon({ event, size = 12 }: { event: Event | ScheduledEvent, size?: number }) {
  const { icon, color } = getCategoryIcon(event)
  const IconComponent = ICON_MAP[icon] ?? FaMapMarkerAlt
  return <IconComponent size={size} color={color} style={{ flexShrink: 0 }} />
}