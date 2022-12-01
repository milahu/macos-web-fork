<script lang="ts">
  import { onMount } from 'svelte';
  import { quintInOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import { elevation } from '$src/actions';
  import { fadeOut } from '$src/helpers/fade';
  import { waitFor } from '$src/helpers/wait-for';
  import { appIcon } from '$src/configs/icons/feathericon';

  let hiddenSplashScreen = false;
  let progressVal = tweened(100, { duration: 3000, easing: quintInOut });

  onMount(async () => {
    $progressVal = 0;
    await waitFor(3000);
    hiddenSplashScreen = true;
  });
</script>

{#if !(hiddenSplashScreen || import.meta.env.DEV)}
  <div out:fadeOut={{ duration: 500 }} class="splash-screen" use:elevation={'bootup-screen'}>
    <img alt="start" src={appIcon['start']}/>

    <div
      class="progress"
      role="progressbar"
      aria-valuenow={100 - $progressVal}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext="Loading up macOS Web"
    >
      <div class="indicator" style:transform="translateX(-{$progressVal}%)" />
    </div>
  </div>
{/if}

<style lang="scss">
  .splash-screen {
    position: fixed;
    top: 0;
    bottom: 0;

    height: 100vh;
    width: 100vw;

    cursor: none;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;

    animation-fill-mode: forwards;

    background-color: #000;

    :global(svg) {
      font-size: 100px;
      color: white;
    }
  }

  .progress {
    border-radius: 50px;

    height: 4px;
    width: 150px;

    overflow-x: hidden;

    background-color: var(--system-color-grey-800);
  }

  .indicator {
    background-color: var(--system-color-grey-100);

    border-radius: inherit;

    width: 100%;
    height: 100%;

    transform: translateX(-0%);
  }

  #audio {
    position: absolute;
    z-index: -9999;

    display: none;
  }
</style>
