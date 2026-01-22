enum RENDERING_CONSTANTS {
  "1500View" = "1500View",
  "1500Text" = "1500Text",
  "1500Image" = "1500Image",
  "5000View" = "5000View",
  "5000Text" = "5000Text",
  "5000Image" = "5000Image",
  RENDER_FLATLIST = 'FLATLIST',
  RENDER_ANIMATIONS = 'ANIMATIONS',
  RESET_LOGS = 'RESETLOGS',
  GET_REPORT = 'GETREPORT',
  RESET_VIEW = 'RESETVIEW',
}

enum TEST_ID_CONSTANTS {
  VIEW_CONTAINER = 'n_view_container',
  TEXT_CONTAINER = 'n_text_container',
  IMAGE_CONTAINER = 'n_image_container',
  FLATLIST_CONTAINER = 'flatlist_container',
  ANIMATION_CONTAINER = 'animation_continer',
  EMPTY_VIEW = 'render_empty_view',
  RENDER_1500_VIEW_BUTTON = 'render_1500_view',
  RENDER_1500_TEXT_BUTTON = 'render_1500_text',
  RENDER_1500_IMAGE_BUTTON = 'render_1500_image',
  RENDER_5000_IMAGE_BUTTON = 'render_5000_image',
  RENDER_5000_VIEW_BUTTON = 'render_5000_view',
  RENDER_5000_TEXT_BUTTON = 'render_5000_text',
  RESET_VIEW_BUTTON = 'reset_view',
  RENDER_FLATLIST_BUTTON = 'render_flatlist',
  RENDER_ANIMATION_BUTTON = 'render_animations',
  RESET_LOGS_BUTTON = 'reset_logs',
  GET_REPORT_BUTTON = 'get_report',
}

const PAINT_START_TIME = "PAINT_START_TIME"
const PAINT_END_TIME = "PAINT_END_TIME"

const OLD_ARCHITECTURE_FILE_NAME = "oldarch"
const NEW_ARCHITECTURE_FILE_NAME = "newarch"

const IS_NEW_ARCHITECTURE_ENABLED = global.nativeFabricUIManager != null

export {RENDERING_CONSTANTS, TEST_ID_CONSTANTS, IS_NEW_ARCHITECTURE_ENABLED, PAINT_START_TIME, PAINT_END_TIME, OLD_ARCHITECTURE_FILE_NAME, NEW_ARCHITECTURE_FILE_NAME};
