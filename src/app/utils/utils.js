const formatDate = date => {
  let dateSplitted = date.split("/");
  let dateReversed = dateSplitted.reverse();
  let dateFormated = dateReversed.join("-");

  return dateFormated;
};

module.exports = {
  formatDate: formatDate
};
