(function () {
  const versions = [
    { id: "v1.1", label: "V1.1", title: "先马·AI Studio", latest: true },
    { id: "v1", label: "V1.0", title: "先马·Centaur", latest: false }
  ];

  function targetFor(versionId, view) {
    if (versionId === "v1") {
      return "../v1/#" + (view === "prd" ? "prd" : "prototype");
    }
    return "../" + versionId + "/#" + (view || "app");
  }

  window.XIANMA_PRD_VERSIONS = {
    all: versions,
    latest: versions.find((version) => version.latest),
    targetFor
  };
})();
