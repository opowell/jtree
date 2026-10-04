// Shapes of what the jtree server sends to admin clients. Only the fields this
// UI reads are declared; the server sends a good deal more.

export interface AppMeta {
  id: string
  shortId: string
  title?: string
  description?: string
  appPath: string
  numPeriods?: number
  groupSize?: number
  hasError?: boolean
  errorLine?: number
  errorPosition?: number
  isStandaloneApp?: boolean
  stages?: string[]
  options?: AppOption[]
  appjs?: string
}

export interface AppOption {
  name: string
  type?: string
  defaultVal?: unknown
  values?: unknown[]
  description?: string
}

export interface QueueApp {
  appId: string
  options: Record<string, unknown>
  indexInQueue?: number
}

export interface QueueShell {
  id: string
  displayName: string
  apps: QueueApp[]
}

export interface SessionShell {
  [key: string]: unknown
  id: string
  name: string
  started: boolean
  isRunning: boolean
  timeStarted: number
  allowNewParts: boolean
  allowAdminClientsToPlay: boolean
  caseSensitiveLabels: boolean
  numParticipants?: number
  numApps?: number
  appSequence?: string[]
}

export interface SessionApp {
  id: string
  shortId: string
  title?: string
  appPath?: string
  indexInSession?: number
  numPeriods?: number
  groupSize?: number
  started?: boolean
  stopAfterPeriod?: boolean
  stages?: Array<{ id: string, duration?: number }>
  periods?: PeriodState[]
  [key: string]: unknown
}

/** A period of an app in an opened session, with its groups and their players. */
export interface PeriodState {
  id: number
  groups?: GroupState[]
  [key: string]: unknown
}

export interface GroupState {
  id: number
  period?: number
  players?: PlayerState[]
  stageTimerStart?: string
  stageTimerDuration?: number
  stageTimerTimeLeft?: number
  [key: string]: unknown
}

export interface PlayerState {
  id: string
  status?: string
  stageIndex?: number
  points?: number
  // A player update nests the stage and group; an opened session's
  // participants carry only their ids.
  stage?: { id?: string } | null
  stageId?: string
  group?: { id?: number | string, period?: { id?: number } }
  groupId?: number | string
  idInGroup?: number
  participantId?: string
  roomId?: string
  // The stage's countdown, when the group's stage has one (milliseconds).
  stageTimerStart?: string
  stageTimerDuration?: number
  stageTimerTimeLeft?: number
  stageTimerRunning?: boolean
  // Everything the app stored on the player.
  [key: string]: unknown
}

export interface Participant {
  id: string
  appIndex: number
  periodIndex: number
  numClients: number
  numPoints: number
  player: PlayerState | null
  /** Every player this participant has been, across apps and periods. */
  players?: PlayerState[]
  [key: string]: unknown
}

export interface SessionFull extends SessionShell {
  [key: string]: unknown
  participants: Record<string, Participant>
  apps: SessionApp[]
}

export interface ServerSettings {
  server?: { ip?: string, port?: number | string }
  autoplayDelay?: string
  [key: string]: unknown
}

export interface AdminRefresh {
  apps: Record<string, AppMeta>
  queues: QueueShell[]
  sessions: SessionShell[]
  settings: ServerSettings
  jtreeLocalPath: string
}

export interface LogEntry {
  id: string
  time: string
  event: string
  text: string
}
