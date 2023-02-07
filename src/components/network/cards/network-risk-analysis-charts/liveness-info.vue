<template>
  <div>
    <h3>What does this chart show?</h3>
    <p class="my-4">
      The network is scanned for sets of validating nodes that intersect every
      quorum (network blocking sets). The chart shows the smallest sizes of
      these sets and, if available, the minimum and maximum for each time
      window.
    </p>
    <h3>What does it mean?</h3>
    <p class="my-4">
      When all the nodes of a network blocking set fail, the network could halt.
      If the chart indicates the minimum size is 3, then 3 specific nodes have
      to fail before this will happen. To find out what these specific nodes
      are, you can time travel to that point in time, and run the network
      analysis tool (left sidebar > tools). The organizations, countries and
      ISP's of these nodes are also shown.
    </p>
    <h3>Limitations of the analysis</h3>
    <p class="my-4">
      Stellarbeat indicates a node as 'not validating' if it was not validating
      in the latest crawl, a specific time window. However a node could be very
      slow or catching up. If other (fast) nodes of a network blocking set are
      down, the slow node could catch up and the network would continue to
      validate. Hence this graph is a risk analysis.<br />
      For ISP and country information of nodes we rely on the
      <a href="https://ipstack.com/">IPstack api</a>. This data is not
      guaranteed to be correct.
    </p>
    <h3>More information</h3>
    <p class="my-4">
      If you want to learn more about network blocking sets, check out the
      following
      <a target="_blank" href="https://arxiv.org/pdf/2002.08101.pdf"
        >white paper</a
      >, more specific the section regarding minimal blocking sets.
    </p>
  </div>
</template>
<style scoped></style>
