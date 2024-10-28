<template>
  <div class="seat-selector">
    <!-- 螢幕顯示 -->
    <div class="screen">
      <div class="screen-label">螢幕</div>
    </div>

    <!-- 座位圖例 -->
    <div class="seat-legend">
      <div class="legend-item">
        <div class="seat-demo available"></div>
        <span>可選座位</span>
      </div>
      <div class="legend-item">
        <div class="seat-demo selected"></div>
        <span>已選座位</span>
      </div>
      <div class="legend-item">
        <div class="seat-demo occupied"></div>
        <span>已售座位</span>
      </div>
    </div>

    <!-- 座位區域 -->
    <div class="seat-container">
      <div v-for="row in seatRows" :key="row" class="seat-row">
        <!-- 排號 -->
        <div class="row-label">{{ getRowLabel(row) }}</div>

        <!-- 座位 -->
        <div
            v-for="col in seatsPerRow"
            :key="`${row}-${col}`"
            class="seat"
            :class="{
            'available': isSeatAvailable(row, col),
            'selected': isSeatSelected(row, col),
            'occupied': isSeatOccupied(row, col)
          }"
            @click="handleSeatClick(row, col)"
        >
          {{ col }}
        </div>
      </div>
    </div>

    <!-- 已選座位資訊 -->
    <div class="selected-seats-info">
      <h4>已選座位</h4>
      <div class="selected-seats-list">
        <template v-if="selectedSeats.length">
          <div v-for="seat in selectedSeats" :key="seat.id" class="selected-seat-item">
            {{ getRowLabel(seat.row) }}排 {{ seat.col }}號
            <button class="remove-seat" @click="removeSeat(seat)">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </template>
        <div v-else class="no-seats-selected">
          尚未選擇座位
        </div>
      </div>
    </div>

    <!-- 座位選擇限制提示 -->
    <div class="seat-limit-info" v-if="maxSeats">
      <p>單次最多可選擇 {{ maxSeats }} 個座位（已選擇 {{ selectedSeats.length }} 個）</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SeatSelector',

  props: {
    // 場次ID
    showingId: {
      type: Number,
      required: true
    },
    // 已售座位
    occupiedSeats: {
      type: Array,
      default: () => []
    },
    // 每排座位數
    seatsPerRow: {
      type: Number,
      default: 10
    },
    // 排數
    seatRows: {
      type: Number,
      default: 8
    },
    // 最大可選座位數
    maxSeats: {
      type: Number,
      default: 4
    }
  },

  data() {
    return {
      selectedSeats: []
    }
  },

  methods: {
    // 獲取排號標籤
    getRowLabel(row) {
      return String.fromCharCode(64 + row) // A, B, C...
    },

    // 檢查座位是否可選
    isSeatAvailable(row, col) {
      return !this.isSeatOccupied(row, col) && !this.isSeatSelected(row, col)
    },

    // 檢查座位是否已選
    isSeatSelected(row, col) {
      return this.selectedSeats.some(seat =>
          seat.row === row && seat.col === col
      )
    },

    // 檢查座位是否已售
    isSeatOccupied(row, col) {
      return this.occupiedSeats.some(seat =>
          seat.row === row && seat.col === col
      )
    },

    // 處理座位點擊
    handleSeatClick(row, col) {
      if (this.isSeatOccupied(row, col)) {
        return
      }

      const seatId = `${row}-${col}`

      if (this.isSeatSelected(row, col)) {
        this.removeSeat({ row, col, id: seatId })
      } else if (this.selectedSeats.length < this.maxSeats) {
        this.selectedSeats.push({
          id: seatId,
          row,
          col,
          label: `${this.getRowLabel(row)}${col}`
        })
        this.$emit('seat-selected', this.selectedSeats)
      } else {
        this.$emit('max-seats-reached')
      }
    },

    // 移除已選座位
    removeSeat(seat) {
      const index = this.selectedSeats.findIndex(s => s.id === seat.id)
      if (index !== -1) {
        this.selectedSeats.splice(index, 1)
        this.$emit('seat-removed', seat)
        this.$emit('seat-selected', this.selectedSeats)
      }
    }
  }
}
</script>

<style scoped>
.seat-selector {
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
}

.screen {
  background: linear-gradient(to bottom, var(--primary-color), transparent);
  height: 40px;
  margin-bottom: var(--spacing-xl);
  border-radius: var(--border-radius-sm);
  position: relative;
}

.screen-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-light);
  font-weight: var(--font-weight-bold);
}

.seat-legend {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.seat-demo {
  width: 20px;
  height: 20px;
  border-radius: var(--border-radius-sm);
}

.seat-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.seat-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.row-label {
  width: 30px;
  text-align: center;
  font-weight: var(--font-weight-bold);
}

.seat {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
}

.seat.available {
  background-color: var(--success-color);
  color: var(--text-light);
}

.seat.selected {
  background-color: var(--primary-color);
  color: var(--text-light);
}

.seat.occupied {
  background-color: var(--danger-color);
  color: var(--text-light);
  cursor: not-allowed;
  opacity: 0.5;
}

.seat:hover:not(.occupied) {
  transform: scale(1.1);
}

.selected-seats-info {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-md);
}

.selected-seats-list {
  margin-top: var(--spacing-sm);
}

.selected-seat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
  margin-bottom: var(--spacing-xs);
}

.remove-seat {
  background: none;
  border: none;
  color: var(--danger-color);
  cursor: pointer;
  padding: var(--spacing-xs);
}

.no-seats-selected {
  color: var(--text-secondary);
  text-align: center;
  padding: var(--spacing-md);
}

.seat-limit-info {
  margin-top: var(--spacing-md);
  text-align: center;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .seat {
    width: 30px;
    height: 30px;
  }

  .seat-legend {
    flex-wrap: wrap;
  }
}
</style>