import { readFiles } from 'h3-formidable'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import Jimp from "jimp";
import { readFileSync } from "node:fs";

import getFileExt from '~/utils/getFileExt';
import shortenUUID from '~/utils/shortenUUID';
import generateRandomString from '~/utils/generateRandomString';

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const client = new S3Client({
    region: 'auto',
    endpoint: runtimeConfig.public.s3Endpoint,
    credentials: {
      accessKeyId: runtimeConfig.public.s3AccessKey,
      secretAccessKey: runtimeConfig.public.s3Secret,
    }
  })
  const bucketName = 'irmania'
  const bucketURLPrefix = 'https://irpics.mgcup.net/'

  // リクエストの内容を読み取る
  const { fields, files: _files, form } = await readFiles(event, {
    // formidable options
    // https://github.com/node-formidable/formidable#options
  })

  const uuid = fields.uuid ? fields.uuid[0] : null
  const compId = fields.compId ? fields.compId[0] : null
  const files = _files.file

  if (!uuid || !compId || !files) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
    })
  }

  // 画像データを読み込む
  const imageFile = files[0]
  if (!imageFile.originalFilename) return ''

  const originalImageBuffer = readFileSync(imageFile.filepath)

  let image = await Jimp.read(originalImageBuffer)
  const width = image.getWidth()
  const height = image.getHeight()
  const compressThresh = 2000
  const jpegQuality = 85

  let ext = getFileExt(imageFile.originalFilename)
  let mimeType = image.getMIME()
  let buffer = originalImageBuffer

  // 画像の解像度が大きすぎる場合、リサイズする
  if (width > compressThresh || height > compressThresh) {
    if (width > height) {
      image = image.resize(compressThresh, Jimp.AUTO)
    } else {
      image = image.resize(Jimp.AUTO, compressThresh)
    }
    image = image.quality(jpegQuality)
    ext = 'jpg'
    mimeType = Jimp.MIME_JPEG
    buffer = await image.getBufferAsync(mimeType)
  }

  // 画像をアップロードする
  const shortUUID = shortenUUID(uuid)
  const randomStr = generateRandomString(8)
  const fileKey = `comp-${compId}/${shortUUID}_${randomStr}.${ext}`

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    Body: buffer,
    ContentType: mimeType,
  })

  try {
    const response = await client.send(command);
    return bucketURLPrefix + fileKey
  } catch (err) {
    console.error(err);
  }

  return ''
})