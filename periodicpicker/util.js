export const createOptions = (size, delta = 0) => {
  let res = []
  for (let i = 0; i < size; i++) {
    res.push({
      title: i + delta + '',
      value: i + delta + ''
    })
  }
  return res
}

export const scrollIntoView = (container, selected) => {
  if (!selected) {
    container.scrollTop = 0
    return
  }

  const top = selected.offsetTop
  const bottom = selected.offsetTop + selected.offsetHeight
  const viewRectTop = container.scrollTop
  const viewRectBottom = viewRectTop + container.clientHeight

  if (top < viewRectTop) {
    container.scrollTop = top
  } else if (bottom > viewRectBottom) {
    container.scrollTop = bottom - container.clientHeight
  }
}

export const fixedDateNumber = (number) => {
  if (number === '') {
    return ''
  }
  number = typeof number === 'number' ? number : +number
  return number < 10 ? '0' + number : number + ''
}

export const formatHourToChinese = (number) => {
  if (number === '') {
    return ''
  }
  number = typeof number === 'number' ? number : +number
  if (number > 12) {
    return '下午' + (number - 12) + '点'
  } else {
    return '上午' + number + '点'
  }
}
