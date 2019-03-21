//BOT OBJ
var Slapform = (function() {

  function $elsByClassName(id, element, classname) {
    // returns a list of objects of element.classname or false.
    // results are cached so function is useless for detecting changed classes, e.g. class="on".
    var a = [], i, obj, pointer;
    element = element || "*";
    pointer = id + element + classname;
    if ($elsByClassName.cache[pointer] === undefined) { // get a result the long way round
      $elsByClassName.cache[pointer] = false; // cache negative result too
      if ($id(id) && classname) {
        obj = $els(id, element); // this result is cached separately
        i = obj.length;
        while (i--) {
          if (hasClass(obj[i], classname)) {
            a.push(obj[i]);
          }
        }
        if (a.length) {
          $elsByClassName.cache[pointer] = a.reverse(); // cache it for next time
        }
      }
    }
    return $elsByClassName.cache[pointer];
  }
  $elsByClassName.cache={}; // create global property

  return {
    $elsByClassName: _$elsByClassName
  };
})();

module.exports = Slapform;
