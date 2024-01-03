export const GameConfig = {
  CUSTOMER: {
    BASE_PAYMENT: 50,
    BONUS_PER_HEART: 4,
    INITIAL_CUSTOMER: { X: 50, Y: 525 },
    NEXT_CUSTOMER_TIME: { MIN: 15000, MAX: 30000 },
    CUSTOMER_COLOR: { 
      RED: '0xff0000', 
      BLUE: '0x00ffff', 
      PURPLE: '0x800080', 
      BLACK: '0x000000' 
    }
  },
  SPACING_Y: 100,
  BOOTHS: {
    COST: {
      BASE: 500,
      GROWTH_RATE: 2,
    },
    PROPERTIES: [
      { X: 900, Y: 500 },
      { X: 900, Y: 300 },
      { X: 600, Y: 500 },
      { X: 600, Y: 300 },
      { X: 300, Y: 500 },
      { X: 300, Y: 300 },
    ],
  },
  SCORE_VALUES: {
    STARTING_SCORE: 0,
    SEATED_CUSTOMER_SCORE: 20,
    ORDER_TAKEN_SCORE: 50,
    MEAL_DROPPED_OFF_SCORE: 100,
    DELIVERED_CHECK_SCORE: 100,
    CLEAN_DIRTY_DISHES_SCORE: 20
  }
}