<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import {
    selectedSubcategories,
    highlightedJobs,
    mergeCombinedData,
    selectedJobs,
    normalizeCategory,
    combinedJobData,
    visibleBounds,
    MAPBOX_TOKEN
  } from '$lib/stores';

  let map;
  let mapContainer;
  let deck;
  let unsubscribeSelectedJobs;
  let unsubscribeSubcats;

  // Function to normalize categories (from your store.js)
  function normalizeCategory(category) {
    if (!category) return '';
    return category.toLowerCase().replace(/[\s/-]+/g, '').replace(/[^a-z0-9]/g, '');
  }

  // Function to update deck.gl layers
  function updateDeckLayers(jobData) {
    const markersData = jobData.map(job => ({
      position: [job.longitude, job.latitude],
      job,
    }));

    const scatterplotLayer = new deckgl.ScatterplotLayer({
      id: 'job-markers',
      data: markersData,
      getPosition: d => d.position,
      getFillColor: d => (d.job.job_category === 'Design' ? [255, 0, 0, 200] : [0, 0, 255, 200]),
      getRadius: d => {
        const salary = d.job.salary?.normalized_yearly_salary;
        return getSalaryRadius(salary);
      },
      pickable: true,
      radiusScale: 10,
      radiusMinPixels: 2,
      onHover: ({ object, x, y }) => {
        if (object) {
          showTooltip({ x, y }, object.job);
        } else {
          hideTooltip();
        }
      },
      onClick: ({ object }) => {
        if (object) {
          // Handle click event if needed
        }
      },
      updateTriggers: {
        getFillColor: [$selectedSubcategories],
      },
    });

    deck.setProps({
      layers: [scatterplotLayer],
    });
  }

  function getSalaryRadius(salary) {
    if (!salary) return 4;
    const minRadius = 3;
    const maxRadius = 12;
    const minSalary = 50000;
    const maxSalary = 300000;

    return (
      minRadius +
      ((Math.min(salary, maxSalary) - minSalary) / (maxSalary - minSalary)) * (maxRadius - minRadius)
    );
  }

  function showTooltip({ x, y }, job) {
    const tooltipDiv = document.getElementById('tooltip');
    tooltipDiv.style.display = 'block';
    tooltipDiv.style.left = `${x + 10}px`;
    tooltipDiv.style.top = `${y - 10}px`;
    tooltipDiv.innerHTML = `
      <div class="tooltip-content">
        <h3>${job.title}</h3>
        <p><strong>Company:</strong> ${job.company_name}</p>
        <p><strong>Location:</strong> ${job.remote_allowed ? 'Remote' : job.location}</p>
        <p><strong>Category:</strong> ${job.job_category}</p>
        ${
          job.salary?.normalized_yearly_salary
            ? `<p><strong>Salary:</strong> $${Math.round(
                job.salary.normalized_yearly_salary
              ).toLocaleString()}/year</p>`
            : ''
        }
      </div>
    `;
  }

  function hideTooltip() {
    const tooltipDiv = document.getElementById('tooltip');
    tooltipDiv.style.display = 'none';
  }

  onMount(async () => {
    if (browser) {
      // Import mapbox-gl and deck.gl
      const { default: mapboxgl } = await import('mapbox-gl');
      const { Deck } = await import('@deck.gl/core');
      const { ScatterplotLayer } = await import('@deck.gl/layers');
      const { MapboxLayer } = await import('@deck.gl/mapbox');

      mapboxgl.accessToken = MAPBOX_TOKEN;

      // Initialize Mapbox map
      map = new mapboxgl.Map({
        container: mapContainer,
        style: 'mapbox://styles/mapbox/light-v10',
        center: [-98, 38],
        zoom: 3,
        minZoom: 0.5,
        maxZoom: 8,
        interactive: true,
        antialias: true,
      });

      await new Promise((resolve) => map.on('load', resolve));

      // Initialize deck.gl
      deck = new Deck({
        canvas: 'deck-canvas',
        initialViewState: {
          longitude: -98,
          latitude: 38,
          zoom: 3,
          pitch: 0,
          bearing: 0,
        },
        controller: true,
        onViewStateChange: ({ viewState }) => {
          map.jumpTo({
            center: [viewState.longitude, viewState.latitude],
            zoom: viewState.zoom,
            bearing: viewState.bearing,
            pitch: viewState.pitch,
          });
        },
        layers: [],
      });

      // Load data
      try {
        const [jobsResponse, skillsResponse] = await Promise.all([
          fetch('/data/processed/jobs_with_coordinates_formatted_1113.json'),
          fetch('/data/processed/combined_skillsDash_1114.json'),
        ]);

        const [jobDataResponse, skillsData] = await Promise.all([
          jobsResponse.json(),
          skillsResponse.json(),
        ]);

        const jobData = Array.isArray(jobDataResponse)
          ? jobDataResponse
          : Object.values(jobDataResponse);

        mergeCombinedData(jobData, skillsData);

        const allJobsArray = Array.from(combinedJobData.get().jobs.values()).flatMap((jobSet) =>
          Array.from(jobSet)
        );

        // Update deck.gl layers
        updateDeckLayers(allJobsArray);

        // Subscribe to selectedJobs and selectedSubcategories changes
        unsubscribeSelectedJobs = selectedJobs.subscribe((selectedJobIds) => {
          updateDeckLayers(allJobsArray);
        });

        unsubscribeSubcats = selectedSubcategories.subscribe(() => {
          updateDeckLayers(allJobsArray);
        });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
  });

  onDestroy(() => {
    if (unsubscribeSelectedJobs) {
      unsubscribeSelectedJobs();
    }
    if (unsubscribeSubcats) {
      unsubscribeSubcats();
    }
    if (map) {
      map.remove();
    }
    if (deck) {
      deck.finalize();
    }
  });
</script>

<main>
  <div class="header">
    <h1>Tech Job Distribution Map</h1>
    <p class="description">
      Geographic distribution of tech and design jobs across the United States
    </p>
    <p class="sub-description">Marker size indicates salary range</p>
  </div>

  <div class="map-container" bind:this={mapContainer}>
    <canvas id="deck-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas>
    <div id="tooltip" class="tooltip"></div>
  </div>

  <div class="legend">
    <h3>Job Categories</h3>
    <div class="legend-item">
      <span class="legend-color" style="background-color: rgba(255, 0, 0, 0.8);"></span>
      <span>Design</span>
    </div>
    <div class="legend-item">
      <span class="legend-color" style="background-color: rgba(0, 0, 255, 0.8);"></span>
      <span>Tech</span>
    </div>
    <div class="legend-item">
      <span class="marker-note">* Marker size indicates salary range</span>
    </div>
  </div>
</main>

<style>
  main {
    width: 100%;
    height: 100vh;
    position: relative;
  }

  .header {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 1;
    background: rgba(255, 255, 255, 0.9);
    padding: 15px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }

  .description {
    margin: 5px 0 0 0;
    font-size: 0.9rem;
    color: #666;
  }

  .sub-description {
    margin: 5px 0 0 0;
    font-size: 0.8rem;
    color: #888;
    font-style: italic;
  }

  .map-container {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .legend {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background: white;
    padding: 15px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1;
  }

  .legend h3 {
    margin: 0 0 10px 0;
    font-size: 0.9rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 0.8rem;
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 8px;
  }

  .marker-note {
    font-size: 0.75rem;
    font-style: italic;
    color: #666;
  }

  .tooltip {
    pointer-events: none;
    position: absolute;
    z-index: 9;
    background: white;
    padding: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: none;
    max-width: 250px;
    font-size: 12px;
  }
</style>
