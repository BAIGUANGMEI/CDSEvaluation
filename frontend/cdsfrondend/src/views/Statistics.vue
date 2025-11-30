<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../api/axios";
import { useThemeStore } from "../stores/theme";
import locales from "../locales";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import "echarts-wordcloud";

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
]);

const themeStore = useThemeStore();
const loading = ref(true);
const errorMsg = ref("");

const courseStats = ref([]);
const comments = ref([]);
const counts = ref({ users: 0, courses: 0, evaluations: 0 });

const t = computed(
  () =>
    locales[themeStore.language].statistics || {
      title: "Data Statistics",
      course_ratings: "Course Ratings",
      word_cloud: "Review Word Cloud",
      loading: "Loading data...",
      no_data: "No data available",
      total_users: "Total Users",
      total_courses: "Total Courses",
      total_evaluations: "Total Evaluations",
    }
);

// Chart Options
const barOption = computed(() => {
  // Show top 15 courses to avoid overcrowding
  const topCourses = courseStats.value.slice(0, 15);
  const courses = topCourses.map(
    (item) => item.course_name || item.course_code
  );
  const ratings = topCourses.map((item) => item.avg_rating.toFixed(1));
  const isDark = themeStore.isDark;

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: courses,
        axisTick: {
          alignWithLabel: true,
        },
        axisLabel: {
          color: isDark ? "#ccc" : "#333",
          interval: 0,
          rotate: 30, // Rotate labels to fit
          overflow: "truncate",
          width: 80,
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        max: 10,
        axisLabel: {
          color: isDark ? "#ccc" : "#333",
        },
        splitLine: {
          lineStyle: {
            color: isDark ? "#333" : "#eee",
          },
        },
      },
    ],
    series: [
      {
        name: "Average Rating",
        type: "bar",
        barWidth: "60%",
        data: ratings,
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#3b82f6" }, // blue-500
              { offset: 1, color: "#6366f1" }, // indigo-500
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };
});

const wordCloudOption = computed(() => {
  // Process comments into word frequency
  // This is a naive implementation. For production, use a proper tokenizer/NLP library.
  // Assuming comments are mixed English/Chinese.
  const text = comments.value.join(" ");
  const words = text.match(/[\u4e00-\u9fa5]{2,}|[a-zA-Z]{3,}/g) || [];
  const counts = {};

  words.forEach((w) => {
    counts[w] = (counts[w] || 0) + 1;
  });

  const data = Object.keys(counts)
    .map((key) => ({
      name: key,
      value: counts[key],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 100);

  return {
    backgroundColor: "transparent",
    tooltip: {
      show: true,
    },
    series: [
      {
        type: "wordCloud",
        shape: "circle",
        left: "center",
        top: "center",
        width: "90%",
        height: "90%",
        right: null,
        bottom: null,
        sizeRange: [12, 60],
        rotationRange: [-90, 90],
        rotationStep: 45,
        gridSize: 8,
        drawOutOfBound: false,
        textStyle: {
          fontFamily: "sans-serif",
          fontWeight: "bold",
          color: function () {
            return (
              "rgb(" +
              [
                Math.round(Math.random() * 160),
                Math.round(Math.random() * 160),
                Math.round(Math.random() * 160),
              ].join(",") +
              ")"
            );
          },
        },
        emphasis: {
          focus: "self",
          textStyle: {
            shadowBlur: 10,
            shadowColor: "#333",
          },
        },
        data: data,
      },
    ],
  };
});

onMounted(async () => {
  try {
    const res = await api.get("/api/statistics");
    courseStats.value = res.data.courseStats;
    comments.value = res.data.comments;
    counts.value = res.data.counts || { users: 0, courses: 0, evaluations: 0 };
  } catch (e) {
    errorMsg.value = "Failed to load statistics";
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="container mx-auto px-4 py-8 relative z-10">
    <h1
      class="text-3xl md:text-4xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300"
    >
      {{ t.title }}
    </h1>

    <div v-if="loading" class="flex justify-center py-20">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"
      ></div>
    </div>

    <div v-else>
      <!-- Counts Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          class="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-6 rounded-3xl shadow-lg shadow-blue-500/5 dark:shadow-none flex items-center justify-between"
        >
          <div>
            <div
              class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              {{ t.total_users }}
            </div>
            <div class="text-3xl font-black text-gray-900 dark:text-white mt-1">
              {{ counts.users }}
            </div>
          </div>
          <div
            class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl"
          >
            👤
          </div>
        </div>

        <div
          class="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-6 rounded-3xl shadow-lg shadow-indigo-500/5 dark:shadow-none flex items-center justify-between"
        >
          <div>
            <div
              class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              {{ t.total_courses }}
            </div>
            <div class="text-3xl font-black text-gray-900 dark:text-white mt-1">
              {{ counts.courses }}
            </div>
          </div>
          <div
            class="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl"
          >
            📚
          </div>
        </div>

        <div
          class="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-6 rounded-3xl shadow-lg shadow-purple-500/5 dark:shadow-none flex items-center justify-between"
        >
          <div>
            <div
              class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              {{ t.total_evaluations }}
            </div>
            <div class="text-3xl font-black text-gray-900 dark:text-white mt-1">
              {{ counts.evaluations }}
            </div>
          </div>
          <div
            class="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xl"
          >
            📝
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Bar Chart -->
        <div
          class="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-6 rounded-3xl shadow-xl shadow-blue-500/5 dark:shadow-none h-[400px] flex flex-col"
        >
          <h3
            class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
          >
            <span class="w-1 h-6 bg-blue-500 rounded-full"></span>
            {{ t.course_ratings }}
          </h3>
          <div class="flex-1 w-full min-h-0">
            <v-chart class="w-full h-full" :option="barOption" autoresize />
          </div>
        </div>

        <!-- Word Cloud -->
        <div
          class="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-6 rounded-3xl shadow-xl shadow-indigo-500/5 dark:shadow-none h-[400px] flex flex-col"
        >
          <h3
            class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
          >
            <span class="w-1 h-6 bg-indigo-500 rounded-full"></span>
            {{ t.word_cloud }}
          </h3>
          <div class="flex-1 w-full min-h-0">
            <v-chart
              class="w-full h-full"
              :option="wordCloudOption"
              autoresize
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
