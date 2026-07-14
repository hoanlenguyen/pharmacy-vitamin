<!--
  Shared site chrome (announcement bar, header, nav, footer) around every page's content.
-->
<template>
  <div class="flex min-h-screen flex-col">
    <AnnouncementBar />
    <TheHeader />
    <!-- <TopLinkRow /> -->
    <MegaMenu />

    <main class="flex-1">
      <slot />
    </main>

    <TheFooter />
  </div>
</template>
