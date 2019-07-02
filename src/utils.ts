import React from 'react'
import {IStyleCustomization } from './types.js';

export const formatBytes = (b: number) => {
  const units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  let l = 0
  let n = b

  while (n >= 1024) {
    n /= 1024
    l += 1
  }

  return `${n.toFixed(n >= 10 || l < 1 ? 0 : 1)}${units[l]}`
}

export const formatDuration = (seconds: number) => {
  const date = new Date(null)
  date.setSeconds(seconds)
  const dateString = date.toISOString().slice(11, 19)
  if (seconds < 3600) return dateString.slice(3)
  return dateString
}

// adapted from: https://github.com/okonet/attr-accept/blob/master/src/index.js
// returns true if file.name is empty and accept string is something like ".csv",
// because file comes from dataTransferItem for drag events, and
// dataTransferItem.name is always empty
export const accepts = (file: File , accept: string) => {
  if (!accept || accept === '*') return true

  const mimeType = file.type || ''
  const baseMimeType = mimeType.replace(/\/.*$/, '')

  return accept
    .split(',')
    .map(t => t.trim())
    .some(type => {
      if (type.charAt(0) === '.') {
        return file.name === undefined || file.name.toLowerCase().endsWith(type.toLowerCase())
      } else if (type.endsWith('/*')) {
        // this is something like an image/* mime type
        return baseMimeType === type.replace(/\/.*$/, '')
      }
      return mimeType === type
    })
}

type ResolveFn<T> = (...args: any[]) => T

export const resolveValue = <T = any>(value: ResolveFn<T> | T, ...args: any[]) => {
  if (typeof value === 'function') return (value as ResolveFn<T>)( ...args)
  return value
}

export const defaultClassNames = {
  dropzone: 'dzu-dropzone',
  dropzoneActive: 'dzu-dropzoneActive',
  dropzoneReject: 'dzu-dropzoneActive',
  dropzoneDisabled: 'dzu-dropzoneDisabled',
  input: 'dzu-input',
  inputLabel: 'dzu-inputLabel',
  inputLabelWithFiles: 'dzu-inputLabelWithFiles',
  preview: 'dzu-previewContainer',
  previewImage: 'dzu-previewImage',
  submitButtonContainer: 'dzu-submitButtonContainer',
  submitButton: 'dzu-submitButton',
}

export const mergeStyles = (
  classNames: IStyleCustomization<string>,
  styles: IStyleCustomization<React.CSSProperties>,
  addClassNames: IStyleCustomization<string>,
  ...args: any[]
) => {
  const resolvedClassNames = { ...defaultClassNames }
  const resolvedStyles = { ...styles }

  for (const key of Object.keys(classNames)) {
    resolvedClassNames[key] = resolveValue(classNames[key], ...args)
  }

  for (const key of Object.keys(addClassNames)) {
    resolvedClassNames[key] = `${resolvedClassNames[key]} ${resolveValue(addClassNames[key], ...args)}`
  }

  for (const key of Object.keys(styles)) {
    resolvedStyles[key] = resolveValue(styles[key], ...args)
  }

  return { classNames: resolvedClassNames, styles: resolvedStyles }
}

export const getFilesFromEvent = (
  event: React.DragEvent<HTMLElement> | React.ChangeEvent<HTMLInputElement>,
): Promise<Array<File | DataTransferItem>> => {
  let items = []
  //@ts-ignore
  if (event.dataTransfer) {
    //@ts-ignore
    const dt = event.dataTransfer

    // NOTE: Only the 'drop' event has access to DataTransfer.files, otherwise it will always be empty
    if (dt.files && dt.files.length) {
      items = dt.files
    } else if (dt.items && dt.items.length) {
      items = dt.items
    }
    //@ts-ignore
  } else if (event.target && event.target.files) {
    //@ts-ignore
    items = event.target.files
  }

  return Array.prototype.slice.call(items)
}