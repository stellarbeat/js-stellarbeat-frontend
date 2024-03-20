<template>
  <div>
    <h2 class="mt-0 mb-4">Warnings and notifications</h2>
    <p>
      Stellarbeat detects and sends notifications for warnings on the network,
      organization and node level. This page describes the different types of
      warnings and notifications and how to resolve them.
        There are three levels of warnings:
        <ul>
            <li>info (blue)</li>
            <li>warning (yellow)</li>
            <li>Danger(red)</li>
            </ul>
    </p>
    <h2>Network warnings</h2>
    <h3>Liveness</h3>
    Liveness warnings indicate when the network is in danger of having slow
    ledger close times or halting altogether. For more information check out the
    following blogpost: TODO
    <h4>Warnings</h4>
      When three nodes or less have the power to delay or or halt the network a warning is shown.
      When the network is halted, a danger warning is shown.
    <h4>Notifications</h4>
      Email notifications are sent for warnings and danger events.
    <h3>Safety</h3>
    <h2>Organization warnings</h2>
    <h2>Node warnings</h2>
    <ul></ul>
  </div>
</template>
<script setup lang="ts">
import useStore from "@/store/useStore";
const store = useStore();
</script>
<style scoped></style>
