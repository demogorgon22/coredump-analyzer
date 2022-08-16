define list_mons
  set var $n = level.monlist
  while $n
    printf "%s\n", $n->data->mname
    set var $n = $n->nmon
  end
end

define list_migrating_mons
  set var $n = migrating_mons
  while $n
    printf "%s\n", $n->data->mname
    set var $n = $n->nmon
  end
end
# Feel free to contribute epic things :)
