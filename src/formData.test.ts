import { describe, expect, it } from 'vitest';
import { formDataToValues } from './formData';

describe('formDataToValues', () => {
  it('returns an empty object for empty FormData', () => {
    expect(formDataToValues(new FormData())).toEqual({});
  });

  it('maps single-valued fields to their string value', () => {
    const formData = new FormData();
    formData.append('email', 'jane@example.com');
    formData.append('message', 'Hello');

    expect(formDataToValues(formData)).toEqual({
      email: 'jane@example.com',
      message: 'Hello',
    });
  });

  it('keeps empty strings', () => {
    const formData = new FormData();
    formData.append('name', '');

    expect(formDataToValues(formData)).toEqual({ name: '' });
  });

  it('collects repeated keys into an array in submission order', () => {
    const formData = new FormData();
    formData.append('tags', 'a');
    formData.append('tags', 'b');
    formData.append('tags', 'c');

    expect(formDataToValues(formData)).toEqual({ tags: ['a', 'b', 'c'] });
  });

  it('keeps single-valued keys as scalars next to repeated ones', () => {
    const formData = new FormData();
    formData.append('name', 'Jane');
    formData.append('color', 'red');
    formData.append('color', 'blue');

    expect(formDataToValues(formData)).toEqual({
      name: 'Jane',
      color: ['red', 'blue'],
    });
  });

  it('returns File entries as File objects', () => {
    const formData = new FormData();
    const file = new File(['content'], 'note.txt', { type: 'text/plain' });
    formData.append('attachment', file);

    const values = formDataToValues(formData);
    expect(values.attachment).toBe(file);
  });

  it('collects repeated File entries into an array', () => {
    const formData = new FormData();
    const first = new File(['1'], 'one.txt');
    const second = new File(['2'], 'two.txt');
    formData.append('files', first);
    formData.append('files', second);

    expect(formDataToValues(formData)).toEqual({ files: [first, second] });
  });

  it('skips prototype-pollution keys without touching Object.prototype', () => {
    const formData = new FormData();
    formData.append('__proto__', 'polluted');
    formData.append('constructor', 'polluted');
    formData.append('prototype', 'polluted');
    formData.append('safe', 'yes');

    const values = formDataToValues(formData);

    expect(values).toEqual({ safe: 'yes' });
    expect(Object.keys(values)).toEqual(['safe']);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(Object.getPrototypeOf(values)).toBe(Object.prototype);
  });
});
