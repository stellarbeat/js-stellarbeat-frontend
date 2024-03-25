<template>
  <div>
    <div class="page-header mt-2 py-3">
      <h1 class="page-title">Docs</h1>
    </div>
    <div class="row">
      <div class="col-lg-3 order-lg-1 mb-4">
        <div class="list-group list-group-transparent mb-0">
          <a
            href="../docs/index.html"
            class="list-group-item list-group-item-action active"
            ><span class="icon mr-3"><i class="fe fe-flag"></i></span>FAQ</a
          >
        </div>
        <!-- Components -->
        <div class="list-group list-group-transparent mb-0">
          <a
            href="../docs/alerts.html"
            class="list-group-item list-group-item-action"
            ><span class="icon mr-3"><i class="fe fe-alert-triangle"></i></span
            >Warnings & notifications</a
          >
          <a
            href="../docs/avatars.html"
            class="list-group-item list-group-item-action"
            ><span class="icon mr-3"><i class="fe fe-user"></i></span
            >Simulation</a
          >
        </div>
      </div>
      <div class="col-lg-9">
        <div class="card">
          <div class="card-body">
            <div class="text-wrap p-lg-6">
              <warnings-and-notifications />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import WarningsAndNotifications from "@/components/docs/warnings-and-notifications.vue";
</script>
