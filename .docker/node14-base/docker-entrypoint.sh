#!/usr/bin/env bash
set -e
set -u
set -o pipefail

[[ ${DOCKER_DEBUG:-} ]] && set -x

if [[ ${1:-} == "bash" ]]; then
  exec "${@}"
  exit;
elif [[ ${1:-} == "sh" ]]; then
    exec "${@}"
    exit;
fi

###
### Globals
###

# Path to scripts to source
CONFIG_DIR="/docker-entrypoint.d"


###
### Source libs
###
init="$( find "${CONFIG_DIR}" -name '*.sh' -type f | sort -u )"
for f in ${init}; do
	# shellcheck disable=SC1090
	echo "[Entrypoint] running $f"
	. "${f}"
done


echo
echo '[Entrypoint] Init process done. Ready for start up.'
echo


exec "${@}"
